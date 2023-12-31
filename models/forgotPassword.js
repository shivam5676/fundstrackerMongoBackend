const mongoose=require("mongoose");
const schema=mongoose.Schema;
const forgotPasswordTableSchema=new schema({
    uuid:{
                type:String,
                required:true,
            },
        isActive:String
})

module.exports=mongoose.model("forgotPasswordTable",forgotPasswordTableSchema)



// const Sequelize=require("sequelize")
// const db=require("../util/database")
// const forgotPasswordTable=db.define("forgotPasswordTable",{
//     uuid:{
//         type:Sequelize.STRING,
//         allowNull:false,
//     },
// isActive:Sequelize.STRING
// })
// module.exports=forgotPasswordTable;