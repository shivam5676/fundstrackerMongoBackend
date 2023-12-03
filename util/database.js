const Sequelize=require("sequelize")
const dotenv=require("dotenv")
dotenv.config();
const sequelize=new Sequelize(process.env.SCHEMA_NAME,process.env.DBUSER_NAME,process.env.DBUSER_PASSWORD,{
    dialect:"mysql",
    host:process.env.HOST_NAME
})





module.exports=sequelize

