const express = require("express");
const userRoutes = require("./Routes/userRoutes");
const sequelize = require("./util/database");

const users = require("./models/user");
const Expenses = require("./models/expense");

const cors = require("cors");
users.hasMany(Expenses);
Expenses.belongsTo(users);
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json({ extended: false }));

app.use(cors());
app.use("/user", userRoutes);
sequelize
  .sync()
  .then((result) => {
    // console.log(result)

    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });
