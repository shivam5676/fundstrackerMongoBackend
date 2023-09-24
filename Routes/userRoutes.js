const express = require("express");
const signupTable = require("../models/signup");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const data = req.body;
  //unique account validation by email
  try {
    const response = await signupTable.findAll({
      where: {
        email: data.email,
      },
    });
    if (response.length === 0) {
      const signupResponse = await signupTable.create({
        name: data.name,
        password: data.password,
        email: data.email,
      });
      console.log(signupResponse);
      return res.status(200).json({ msg: "account successfully created" });
    } else {
      return res.status(200).json({
        msg: "An account with the same email id is present. Please try with another email id.",
      });
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
