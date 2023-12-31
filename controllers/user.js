const expense = require("../models/expense");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const user = require("../models/user");
const sequelize = require("../util/database");
const mg = require("../util/mailgunServices");
const dotenv = require("dotenv");
const uuid = require("uuid");
const forgotPasswordTable = require("../models/forgotPassword");

const ses = require("../util/amazonses");

dotenv.config();
function tokenmaker(id, name) {
  const secretkey = process.env.SECRET_KEY;
  return jwt.sign({ userId: id, name: name }, secretkey);
}

exports.loginController = async (req, res, next) => {
  const data = req.body;
  try {
    const savedUser = await user.findOne({
      email: data.email,
    });

    if (!savedUser) {
      return res
        .status(404)
        .json({ message: "user does not exist with this email id" });
    }
    try {
      const comparedHashPassword = await bcrypt.compare(
        data.password,
        savedUser.password
      );

      if (comparedHashPassword === true) {
        return res.status(200).json({
          message: "Account successfully loggined",
          token: tokenmaker(savedUser.id, savedUser.name),
          premium: savedUser.isPremium,
        });
      } else {
        return res
          .status(401)
          .json({ message: "Incorrect password", status: "failed" });
      }
    } catch (err) {
      return res.status(500).json({
        message: "Error during password verification",
        status: "failed",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
};

exports.signupController = async (req, res, next) => {
  const data = req.body;

  if (data.name.length == 0) {
    return res
      .status(401)
      .json({ status: "failed", message: "name can not be empty" });
  }
  if (data.email.length == 0 || !data.email.includes("@")) {
    return res.status(401).json({
      status: "failed",
      message: "email must contains @",
    });
  }
  if (data.password != data.confirmPassword) {
    return res.status(401).json({
      status: "failed",
      message: "password and confirm password is not same",
    });
  }
  if (data.password.length < 6) {
    return res.status(401).json({
      status: "failed",
      message: "password can not be smaller than 6 digit ",
    });
  }
  // Unique account validation by email
  try {
    const response = await user.findOne({
      email: data.email,
    });

    if (!response) {
      const saltrounds = 10;
      try {
        //we using a different try catch block only for getting error related to hasing process
        // Attempt to hash the password
        const encryptedPassword = await bcrypt.hash(data.password, saltrounds);

        // If hashing is successful, create the user
        const newUser = new user({
          name: data.name,
          password: encryptedPassword,
          email: data.email,
          isPremium: "false",
          totalExpense: 0,
        });

        await newUser.save();
        return res
          .status(200)
          .json({ message: "Account successfully created" });
      } catch (hashingError) {
        return res.status(500).json({
          status: "failed",
          message: "Error creating the account. Please try again later.",
        });
      }
    } else {
      return res.status(401).json({
        status: "failed",
        message:
          "An account with the same email id is present. Please try with another email id.",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};
exports.addExpenseController = async (req, res, next) => {
  const item = req.body;
  const session = await mongoose.startSession(); //transaction help us if we want to update some data from two or more place and at any place it fails to update then transaction will remove that data from first table too

  try {
    await session.withTransaction(async () => {
      const createdItem = await expense.create(
        [
          {
            amount: item.amount,
            category: item.category,
            description: item.description,

            userId: req.user.id,
          },
        ],

        { session: session }
      );

      const response = await user.findOne(
        {
          _id: req.user.id,
        },
        null,
        { session: session }
      );

      response.totalExpense += item.amount;
      await response.save();

      await session.commitTransaction();
      return res
        .status(200)
        .json({ message: "data added successfully", createdItem });
    });
  } catch (err) {
    session.abortTransaction();

    await session.endSession();
    return res.status(500).json(err);
  }
};

exports.getExpenseController = async (req, res, next) => {
  const pageNo = req.query.pageNo ? +req.query.pageNo : 1; // Default to page 1 if pageNo is not provided
  const pageSize = req.query.item ? +req.query.item : 10000000; // Default to pageSize 10 if item is not provided
  let offset = (pageNo - 1) * pageSize; //this will exclude item which is counted in previous page
  //like if page no is 1 then offset will be (1-1=0) ==> 0*10(pagesize is 10)==>item excluded =0
  //in 2 nd page (2-1=1)==>1*10==>10item from starting will be excluded
  try {
    const result = await expense
      .find({
        userId: req.user.id,
      })
      .limit(pageSize)
      .skip(offset);

    let nextPage = true;
    let previousPage = true;
    let currentPage = pageNo;
    if (pageNo === 1) {
      previousPage = false;
    }

    if (result.length < pageSize) {
      nextPage = false;
    }

    return res.status(200).json({
      result: result,
      nextPage: nextPage,
      currentPage: currentPage,
      previousPage: previousPage,
      username: req.user.name,
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.deleteExpenseController = async (req, res, next) => {
  const delId = req.body.id;
  console.log(delId);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await expense.findOne(
        {
          _id: delId,

          userId: req.user.id,
        },
        null,
        { session: session }
      );

      const response = await user.findOne(
        {
          _id: req.user.id,
        },
        null,
        { session: session }
      );

      response.totalExpense -= result.amount;

      await response.save({ session: session });
      await result.deleteOne({ _id: delId }).session(session);
      await session.commitTransaction();

      return res.status(200).json({ message: "data deleted successfully" });
    });
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).json({ message: err });
  }
};

exports.sendPassword = async (req, res) => {
  const requestedEmail = req.body.email;

  if (requestedEmail.length == 0) {
    return res.status(401).json({
      message: "there is no value you provided in email field..",
    });
  }
  try {
    const validUser = await user.findOne({
      email: requestedEmail,
    });

    const uuidv4 = uuid.v4();
    if (!validUser) {
      return res.status(401).json({
        status: "failed",
        message:
          "email id is not present in our database, enter correct email id ",
      });
    }
    const created = await forgotPasswordTable.create({
      uuid: uuidv4,
      isActive: "True",
      userId: validUser._id,
    });

    // const params = {
    //   Destination: {
    //     ToAddresses: [validUser.dataValues.email], // Replace with the recipient's email address
    //   },
    //   Message: {
    //     Body: {
    //       Text: {
    //         Data: `hello ${validUser.dataValues.name} ,welcome to funds tracker password recovery system .we have recieved an request for changing Your password ,if you requested for changing password then you can click on this link http://localhost:3000/updatePassword/${uuidv4}`,
    //       },
    //     },
    //     Subject: {
    //       Data: "funds tracker password recovery email",
    //     },
    //   },
    //   Source: "shivam.handler@gmail.com", // Replace with your verified sender email address
    // };

    // ses.sendEmail(params, (err, data) => {
    //   if (err) {
    //     console.error("Error:", err);
    //   } else {
    //     console.log("Email sent successfully:", data);
    //   }
    // });

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "shivam@fundTracker.com",
      to: "shivam.handler@gmail.com",
      subject: "funds tracker password recovery ",
      text: `hello ${validUser.name} ,welcome to funds tracker password recovery system .we have recieved an request for changing Your password ,if you requested for changing password then you can click on this link http://localhost:3000/updatePassword/${uuidv4}`,
    });

    return res.status(200).json({
      status: "success",
      message: "Email sent successfully,please check ur inbox",
      data: response,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message:
        "there was an unexpected problem while sending ur request ..try again ",
      error: err,
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  const Extracteduuid = req.body.uuid;

  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if (password.length < 6) {
    return res
      .status(401)
      .json({ message: "password should contains 6 or more character " });
  }

  if (password != confirmPassword) {
    return res
      .status(401)
      .json({ message: "password and confirm password are not same " });
  }
  try {
    const passwordChangeRequest = await forgotPasswordTable.findOne({
      uuid: Extracteduuid,
      isActive: "True",
    });

    if (!passwordChangeRequest)
      return res.status(402).json({
        status: "false",
        message:
          "there is no active request for changing password or this link expired ...send request again",
      });
    const passwordUpdate = await user.findOne({
      id: passwordChangeRequest.userId,
    });
    const saltrounds = 10;
    const EncryptedPassword = await bcrypt.hash(password, saltrounds);

    const changedPassword = await passwordUpdate.updateOne({
      password: EncryptedPassword,
    });

    const updateactive = await passwordChangeRequest.updateOne({
      isActive: "false",
    });
    return res.status(200).json({
      status: "success",
      message: "password succeessfully changed",
    });
  } catch (err) {
    return res.status(400).json({ status: "false", message: err });
  }
};
