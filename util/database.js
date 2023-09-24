const Sequelize=require("sequelize")
const sequelize=new Sequelize("expense-project","root","(@Shivam",{
    dialect:"mysql",
    host:"localhost"
})


module.exports=sequelize