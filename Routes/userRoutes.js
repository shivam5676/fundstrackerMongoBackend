const express = require("express");
const signupTable = require("../models/user");
const expense = require("../models/expense");
const router = express.Router();
const bcrypt = require("bcrypt");
router.post("/login", async (req, res, next) => {
  const data = req.body;
  try {
    const savedUser = await signupTable.findOne({
      where: {
        email: data.email,
      },
    });

    if (savedUser.length === 0) {
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
        console.log("execute");
        return res.status(200).json({ msg: "Account successfully loggined" });
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
});

router.post("/signup", async (req, res, next) => {
  const data = req.body;
  // Unique account validation by email
  try {
    const response = await signupTable.findAll({
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
        const signupResponse = await signupTable.create({
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
});
router.post("/addexpense", (req, res, next) => {
  const item = req.body;
  expense
    .create({
      amount: item.amount,
      category: item.category,
      description: item.description,
    })
    .then((result) => {
     return res.status(200).json({msg:"data added successfully"})
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/getexpense", (req, res, next) => {
  expense
    .findAll()
    .then((result) => {
      console.log(result);
     return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/deleteexpense", async (req, res, next) => {
  const delId = req.body.id;
  try {
    const result =await expense.findOne({
      where: {
        id: delId,
      },
    });
    await result.destroy();
    return res.status(200).json({msg:"data deleted successfully"});
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
