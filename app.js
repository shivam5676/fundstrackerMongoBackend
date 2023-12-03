const express = require("express");
const userRoutes = require("./Routes/userRoutes");
const premiumUserRoutes=require("./Routes/premiumUser")
const sequelize = require("./util/database");
const download=require("./models/downloadUrl")
const users = require("./models/user");
const Expenses = require("./models/expense");
const bodyParser = require("body-parser");
const Order = require("./models/order");
const user = require("./models/user");
const https=require("https")
const dotenv=require("dotenv")
const forgotPasswordRequest=require("./models/forgotPassword")
const cors = require("cors");
const fs = require("fs");


dotenv.config()
// const privatekey=fs.readFileSync("server.key")
// const certificate=fs.readFileSync("server.cert")

users.hasMany(Expenses);
Expenses.belongsTo(users);

users.hasMany(Order)
Order.belongsTo(user)

users.hasMany(forgotPasswordRequest);
forgotPasswordRequest.belongsTo(users)

users.hasMany(download)
download.belongsTo(users)

const app = express();

app.use(bodyParser.json({ extended: false }));

app.use(cors({
  origin: '*'
}))

app.use("/user", userRoutes);
app.use("/premiumUser",premiumUserRoutes)
sequelize
  .sync()
  .then((result) => {
   
console.log(result)
    app.listen(process.env.PORT);
  //  now we will not use this we will use https server

  //  https.createServer(app).listen(8000,()=>{
  //   console.log("app running")
  //  })
 
  })
  .catch((err) => {
    console.log(err);

  });
