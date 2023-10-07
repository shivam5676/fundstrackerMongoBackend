const dotenv=require("dotenv")

const formData = require("form-data");
const Mailgun = require("mailgun.js");


dotenv.config()
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
username: "shivam singh",
key: process.env.MAILGUN_API_KEY,
});

module.exports=mg