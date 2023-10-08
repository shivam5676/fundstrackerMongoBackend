const Sequelize=require("sequelize")
const db=require("../util/database")
const forgotPasswordTable=db.define("forgotPasswordTable",{
    uuid:{
        type:Sequelize.STRING,
        allowNull:false,
    },
isActive:Sequelize.STRING
})
module.exports=forgotPasswordTable;