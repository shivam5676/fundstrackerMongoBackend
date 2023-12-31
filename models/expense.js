const mongoose = require("mongoose");

const schema = mongoose.Schema;
const expenseSchema = new schema({
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId:{
    type:schema.Types.ObjectId
  }
  ,
  createdAt: { type: Date, default: Date.now } 
  // user: {
  //   type: schema.Types.ObjectId,
  //   ref: "user",
  //   required:true
  // },
});
module.exports = mongoose.model("Expenses", expenseSchema);

// const Sequelize=require("sequelize")
// const db=require("../util/database")
// const Expenses=db.define("expenses",{
//     id:{
//         type:Sequelize.INTEGER,
//         allowNull:false,
//         autoIncrement:true,
//         primaryKey:true
//     },
//     amount:{
//         type:Sequelize.INTEGER,
//         allowNull:false
//     },
//     category:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     description:{
//         type:Sequelize.STRING,
//         allowNull:false
//     }
// })
// module.exports=Expenses;
