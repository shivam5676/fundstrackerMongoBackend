const Sequelize=require("sequelize")
const db=require("../util/database")
const Expenses=db.define("expenses",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    amount:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    category:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    }
})
module.exports=Expenses;