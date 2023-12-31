const express = require("express");
const userRoutes = require("./Routes/userRoutes");
const premiumUserRoutes = require("./Routes/premiumUser");

const bodyParser = require("body-parser");


const dotenv = require("dotenv");

const cors = require("cors");

const mongoose= require("mongoose");

dotenv.config();
console.log(process.env.testing)
// const privatekey=fs.readFileSync("server.key")
// const certificate=fs.readFileSync("server.cert")



const app = express();

app.use(bodyParser.json({ extended: false }));

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: process.env.METHODS,
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use("/user", userRoutes);
app.use("/premiumUser", premiumUserRoutes);
mongoose
  .connect(process.env.MONGO_CONNECTIONSTRING)
  .then((result) => {
    app.listen(process.env.PORT,()=>{
       console.log(`"app running",${process.env.PORT}`)
    });
   

    //  https.createServer(app).listen(8000,()=>{
     
    //  })
  })
  .catch((err) => {
    
    console.log(err);
  });
