const express=require("express")
const userRoutes=require("./Routes/userRoutes")
const sequelize=require("./util/database")
const db=require("./models/signup")
const cors=require("cors");
const bodyParser=require("body-parser")
const app=express();

app.use(bodyParser.json({extended:false}))

app.use(cors())
app.use("/user",userRoutes)
sequelize.sync().then((result)=>{
    console.log(result)
app.listen(8000)

}).catch((err)=>{
    console.log(err)
})

