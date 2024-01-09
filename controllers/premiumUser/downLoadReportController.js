const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const { Op } = require("sequelize");

const expense = require("../../models/expense");



const Expenses = require("../../models/expense");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const downloadtable = require("../../models/downloadUrl");
dotenv.config();

//only for aws upload
// function s3upload(filename, data) {
//     return new Promise((resolve, reject) => {
//       const bucketName = "fundtracker";
//       const IAMuserKey = process.env.IAM_ACCESSKEY;
//       const IAMSECRETKEY = process.env.IAM_USER_SECRETKEY;
//       let s3bucket = new AWS.S3({
//         accessKeyId: IAMuserKey,
//         secretAccessKey: IAMSECRETKEY,
//       });
  
//       var params = {
//         Bucket: bucketName,
//         Key: filename,
//         Body: data,
//         ACL: "public-read",
//       };
//       s3bucket.upload(params, (err, response) => {
//         if (err) {
//           console.log(err);
//           reject(err);
//         } else {
//           resolve(response.Location);
//         }
//       });
//     });
//   }

// Replace these values with your Azure Storage account information


async function uploadFileToBlob(filename,expenseData) {
const connectionString =  process.env.CONNECTIONSTRING;
const containerName =process.env.CONTAINER_NAME;

const blobName = filename;



  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

 
  const contentLength = Buffer.from(expenseData).length;

  await blockBlobClient.upload(expenseData, contentLength);
return blockBlobClient.url
 
}

uploadFileToBlob().catch((error) => {
  console.error("Error uploading file:", error.message);
});



const DownloadReport = async (req, res, next) => {
  console.log("data")
  const toDate=req.query.toDate;
  const fromDate=req.query.fromDate;
  const data={
    toDate:toDate,
    fromDate:fromDate
  }
  console.log(toDate)
  try {
    const expense = await Expenses.find({
    
        userId: req.user.id,
     
     
    });
    const stringifiedExpenses = JSON.stringify(expense);
    
    const filename = `Expenses${req.user.id}/${new Date()}`;
    const fileUrl = await uploadFileToBlob(filename, stringifiedExpenses);
   

    const savedFile = await downloadtable.create({
      fileURL: fileUrl,
      userId: req.user.id,
      toDate:toDate,
      fromDate:fromDate
    });
    // console.log(savedFile);
    return res.status(200).json({ file: fileUrl});
  } catch (err) {
    
    return res.status(403).json({ message: err });
  }
};
module.exports=DownloadReport