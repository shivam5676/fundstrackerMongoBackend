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

const forgotPasswordRequest=require("./models/forgotPassword")
const cors = require("cors");



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

app.use(cors());

app.use("/user", userRoutes);
app.use("/premiumUser",premiumUserRoutes)
sequelize
  .sync()
  .then((result) => {
    // console.log(result)

    app.listen(8000);
 
  })
  .catch((err) => {
    console.log(err);

  });
