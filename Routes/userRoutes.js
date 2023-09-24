const express = require("express");
const signupTable = require("../models/signup");
const router = express.Router();
router.post("/login", async(req, res, next) => {
  const data = req.body;
  try{
     const loginResponse=await signupTable.findAll({
    where:{
      email:data.email
    } 
  })
  if(loginResponse.length===0){
    return res.status(404).json({msg:"user does not exist with this email id"})
  }
 const passwordResponse=await signupTable.findAll({
  where:{
    password:data.password
  }
 })
 if(passwordResponse.length===0){
  return res.status(401).json({msg:"password is not match"})
}

return res.status(201).json({msg:"user login successfully"})
  }
  catch(err){
    console.log(err)
  }
 
});

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

      return res.status(200).json({ msg: "account successfully created" });
    } else {
      return res.status(401).json({
        msg: "An account with the same email id is present. Please try with another email id.",
      });
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
