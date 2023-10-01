const userDb = require("../models/user");
const expense = require("../models/expense");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const controller = require("../controllers/user");

function tokenmaker(id, name) {
  console.log(id, name);
  const secretkey = "1234abcdefg";
  return jwt.sign({ userId: id, name: name }, secretkey);
}

exports.loginController = async (req, res, next) => {
  const data = req.body;
  try {
    const savedUser = await userDb.findOne({
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
    const response = await userDb.findAll({
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
        const signupResponse = await userDb.create({
          name: data.name,
          password: encryptedPassword,
          email: data.email,
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
exports.addExpenseController = (req, res, next) => {
  const item = req.body;
  console.log("executed")
  expense
    .create({
      amount: item.amount,
      category: item.category,
      description: item.description,

      userId: req.userId,
    })
    .then((result) => {
      return res.status(200).json({ msg: "data added successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getExpenseController = (req, res, next) => {
  expense
    .findAll({
      where: {
        userId: req.userId,
      },
    })
    .then((result) => {
      console.log(result);
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteExpenseController = async (req, res, next) => {
  const delId = req.body.id;
  try {
    const result = await expense.findOne({
      where: {
        id: delId,

        userId: req.userId,
      },
    });
    await result.destroy();
    return res.status(200).json({ msg: "data deleted successfully" });
  } catch (err) {
    console.log(err);
  }
};
