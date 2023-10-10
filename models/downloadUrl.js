const Sequelize=require("sequelize")
const db = require("../util/database")
const downloadtable=db.define("downloadURL",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    fileURL:Sequelize.STRING
})
module.exports=downloadtable