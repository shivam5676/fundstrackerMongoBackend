// const Sequelize=require("sequelize")
// const db=require("../util/database")

const mongoose = require("mongoose");
const schema=mongoose.Schema;
const orderSchema=new schema({
   amount:Number,
orderId:String,
status:String,
paymentId:String
})
module.exports=mongoose.model("order",orderSchema)
// const Order=db.define("order",{
// id:{
//    type: Sequelize.INTEGER,
//    autoIncrement:true,
//    allowNull:false,
//    primaryKey:true
// },
// amount:Sequelize.INTEGER,
// orderId:Sequelize.STRING,
// status:Sequelize.STRING,
// paymentId:Sequelize.STRING
// })
// module.exports=Order
