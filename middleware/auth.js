const jwt = require("jsonwebtoken");
const UserDb = require("../models/user");
const authenticate = async (req, res, next) => {
  const secretkey = "1234abcdefg";
  try {
    const token = req.header("authorization");

    const validUser = jwt.verify(token, secretkey);
    console.log(validUser);

    const result = await UserDb.findByPk(validUser.userId);
    if (result) {
      req.userId = result.id; //we are saving user instance in req to handle next middleware
      next();
    }
  } catch (err) {
    return res.status(400).json({ success: false });
  }
};
module.exports = authenticate;
