const jwt = require("jsonwebtoken");
const UserDb = require("../models/user");
const authenticate = async (req, res, next) => {
  const secretkey = "1234abcdefg";
  try {
    const token = req.header("authorization");

    const validUser = jwt.verify(token, secretkey);
 

    const result = await UserDb.findOne({_id:validUser.userId});
    console.log(result)
    if (result) {
      req.user= result; //we are saving user instance in req to handle that user in  next middleware
   
      next();
    }
  } catch (err) {
    return res.status(400).json({ success: false,msg:"we could not verify user" });
  }
};
module.exports = authenticate;
