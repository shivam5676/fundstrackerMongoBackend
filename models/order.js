const Sequelize=require("sequelize")
const db=require("../util/database")

const Order=db.define("order",{
id:{
   type: Sequelize.INTEGER,
   autoIncrement:true,
   allowNull:false,
   primaryKey:true
},
amount:Sequelize.INTEGER,
orderId:Sequelize.STRING,
status:Sequelize.STRING,
paymentId:Sequelize.STRING
})
module.exports=Order