const express = require("express");
const userRoutes = require("./Routes/userRoutes");
const premiumUserRoutes=require("./Routes/premiumUser")
const sequelize = require("./util/database");

const users = require("./models/user");
const Expenses = require("./models/expense");
const bodyParser = require("body-parser");
const Order = require("./models/order");
const user = require("./models/user");
const cors = require("cors");



users.hasMany(Expenses);
Expenses.belongsTo(users);

users.hasMany(Order)
Order.belongsTo(user)


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
