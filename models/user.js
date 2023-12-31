const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremium: String,
  totalExpense: Number,
});
module.exports = mongoose.model("user", userSchema);
// const Sequelize=require("sequelize")
// const db=require("../util/database")

// const user=db.define("user",{
//     id:{
//         type:Sequelize.INTEGER,
//         autoIncrement:true,
//         allowNull:false,
//         primaryKey:true
//     },
//     name:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     email:{
//         type:Sequelize.STRING,
//         allowNull:false

//     },
//     password:{
//         type:Sequelize.STRING,
//         allowNull:false,

//     },
//     isPremium:Sequelize.STRING,
//     totalExpense:Sequelize.INTEGER

// })
// module.exports=user;
