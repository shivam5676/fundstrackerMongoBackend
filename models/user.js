const Sequelize=require("sequelize")
const db=require("../util/database")

const user=db.define("user",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false,

    },
    isPremium:Sequelize.STRING
    
})
module.exports=user;