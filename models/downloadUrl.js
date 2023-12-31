const mongoose = require("mongoose");

const schema = mongoose.Schema;
const downloadTableSchema = new schema({
  fileURL: String,
  toDate: String,
  fromDate: String,
  userId:mongoose.Types.ObjectId,
  createdAt: { type: Date, default: Date.now } 
});
module.exports = mongoose.model("downloadURL", downloadTableSchema);

// const Sequelize=require("sequelize")
// const db = require("../util/database")
// const downloadtable=db.define("downloadURL",{
//     id:{
//         type:Sequelize.INTEGER,
//         allowNull:false,
//         autoIncrement:true,
//         primaryKey:true
//     },
//     fileURL:Sequelize.STRING,
//     toDate:Sequelize.STRING,
//     fromDate:Sequelize.STRING
// })
// module.exports=downloadtable
