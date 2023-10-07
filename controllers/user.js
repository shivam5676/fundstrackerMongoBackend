const expense = require("../models/expense");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const user = require("../models/user");
const sequelize = require("../util/database");
const mg = require("../util/mailgunServices");
const dotenv=require("dotenv")

function tokenmaker(id, name) {
  console.log(id, name);
  const secretkey = "1234abcdefg";
  return jwt.sign({ userId: id, name: name }, secretkey);
}

exports.loginController = async (req, res, next) => {
  const data = req.body;
  try {
    const savedUser = await user.findOne({
      where: {
        email: data.email,
      },
    });
    console.log(savedUser);
    if (savedUser === null) {
      return res
        .status(404)
        .json({ msg: "user does not exist with this email id" });
    }
    try {
      const comparedHashPassword = await bcrypt.compare(
        data.password,
        savedUser.password
      );
      console.log("compare", comparedHashPassword);
      if (comparedHashPassword === true) {
        console.log("execute", savedUser.id, savedUser.name);
        return res.status(200).json({
          msg: "Account successfully loggined",
          token: tokenmaker(savedUser.id, savedUser.name),
          premium: savedUser.isPremium,
        });
      } else {
        return res.status(401).json({ msg: "Incorrect password" });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ msg: "Error during password verification" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.signupController = async (req, res, next) => {
  const data = req.body;
  // Unique account validation by email
  try {
    const response = await user.findAll({
      where: {
        email: data.email,
      },
    });
    if (response.length === 0) {
      const saltrounds = 10;

      try {
        //we using a different try catch block only for getting error related to hasing process
        // Attempt to hash the password
        const encryptedPassword = await bcrypt.hash(data.password, saltrounds);

        // If hashing is successful, create the user
        const signupResponse = await user.create({
          name: data.name,
          password: encryptedPassword,
          email: data.email,
          isPremium: "false",
          totalExpense: 0,
        });

        return res.status(200).json({ msg: "Account successfully created" });
      } catch (hashingError) {
        console.error("Error during password hashing:", hashingError);
        return res
          .status(500)
          .json({ msg: "Error creating the account. Please try again later." });
      }
    } else {
      return res.status(401).json({
        msg: "An account with the same email id is present. Please try with another email id.",
      });
    }
  } catch (err) {
    console.error("Error during account validation:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};
exports.addExpenseController = async (req, res, next) => {
  const item = req.body;
  const t = await sequelize.transaction(); //transaction help us if we want to update some data from two or more place and at any place it fails to update then transaction will remove that data from first table too
  try {
    await expense.create(
      {
        amount: item.amount,
        category: item.category,
        description: item.description,

        userId: req.user.id,
      },
      { transaction: t }
    );
    const response = await user.findOne(
      {
        where: {
          id: req.user.id,
        },
      },
      { transaction: t }
    );
    console.log("responsesssssssss", response);
    await response.update(
      {
        totalExpense: response.totalExpense + item.amount,
      },
      { transaction: t }
    );
    await t.commit();
    return res.status(200).json({ msg: "data added successfully", response });
  } catch (err) {
    await t.rollback();
    return res.status(500).json(err);
  }
};

exports.getExpenseController = async (req, res, next) => {
  try {
    const result = await expense.findAll({
      where: {
        userId: req.user.id,
      },
    });

    return res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteExpenseController = async (req, res, next) => {
  const delId = req.body.id;
  const t = await sequelize.transaction();
  try {
    const result = await expense.findOne(
      {
        where: {
          id: delId,

          userId: req.user.id,
        },
      },
      { transaction: t }
    );
    const response = await user.findOne(
      {
        where: {
          id: req.user.id,
        },
      },
      { transaction: t }
    );
    await response.update(
      {
        totalExpense: response.totalExpense - result.amount,
      },
      { transaction: t }
    );
    await t.commit();
    await result.destroy();
    return res.status(200).json({ msg: "data deleted successfully" });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ msg: err });
  }
};
dotenv.config()
exports.sendPassword = async (req, res) => {
  
console.log(process.env.MAILGUN_DOMAIN)
  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "shivam@fundsTracker.com",
      to: "shivam.handler@gmail.com",
      subject: "funds tracker password recovery ",
      text: "user dummy password",
    });

    res.status(200).json({
      status: "success",
      message: "Email sent successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Email not sent",
    });
  }
};
