const AWS = require('aws-sdk');
const dotenv=require("dotenv")
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AMAZON_IAM_ACCESSKEY,         // Replace with your IAM user's Access Key ID
  secretAccessKey: process.env.AMAZON_IAM_SECRETKEY,     // Replace with your IAM user's Secret Access Key
  region: 'eu-north-1',                  // Replace with your AWS region
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });
module.exports=ses