const express=require("express");
const router=express.Router();

router.post("/signup",(req,res,next)=>{
    const data=req.body;
console.log("signuptesting",data)
})
module.exports=router;
