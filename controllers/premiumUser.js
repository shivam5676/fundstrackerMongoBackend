const expense = require("../models/expense");

const RazorPay = require("razorpay");
const Order = require("../models/order");
const user = require("../models/user");
const Expenses = require("../models/expense");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const downloadtable = require("../models/downloadUrl");
dotenv.config();

exports.leaderBoardController = async (req, res, next) => {
  const leaderboardData = {};

  try {
    const result = await user.findAll();
    //method 1 most optimised method cause we are directly fetching data from only user table
    Object.values(result).forEach((current) => {
      console.log(current.dataValues);
      const index = current.dataValues.id;
      if (!leaderboardData[index]) {
        leaderboardData[index] = {
          userId: current.dataValues.id,
          user: current.dataValues.name,
          totalExpense: current.dataValues.totalExpense,
        };
      }
    });

    res.status(201).json({ leaderboardData });

    //method 2 optimised start from here
    // const result = await expense.findAll({
    //   include: [
    //     {
    //       model: user, //we are using include properties for joining two tables and later we will fetch both data
    //     },
    //   ],
    // });

    // result.forEach((expense) => {
    //   const userData = expense.user.dataValues; // Access user table data here
    //   const expenseData = expense.dataValues; //access expense table data here

    //   if (!leaderboardData[userData.id]) {
    //     leaderboardData[userData.id] = {
    //       totalExpense: 0,
    //       userId: userData.id,
    //       user: userData.name,
    //     };
    //   }
    //   leaderboardData[userData.id].totalExpense += expenseData.amount;
    // });

    // res.status(201).json({ leaderboardData });
    //method 2 ends here

    //method 3 not optimised

    // const result = await expense.findAll({
    //   attributes:["userId","amount"]//optimisation we only take two attributes from table cause we want to work with those two only this will optimise code by 60 to 70 %
    // });
    // console.log(result)
    // Object.values(result).forEach((index) => {
    //   if (!leaderboardData[index.dataValues.userId]) {
    //     leaderboardData[index.dataValues.userId] = {
    //       totalExpense: 0,
    //       userId: index.dataValues.userId,
    //     };
    //   }
    //   leaderboardData[index.dataValues.userId].totalExpense +=
    //     index.dataValues.amount;
    // });

    // const promises = Object.values(leaderboardData).map( async (current) => {
    //   const searchedUser =await  user.findOne({
    //     where: {
    //       id: current.userId,
    //     },
    //   });

    //   current.userId = searchedUser.dataValues.name;

    // });
    // await Promise.all(promises);//we are promises.all for solving all promise after that we will send response so that our updated data would be send to server
    // res.status(201).json({ leaderboardData });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.activateMemberController = async (req, res, next) => {
  console.log("req successfully recieved", req.user);
  try {
    const rzr = new RazorPay({
      key_id: process.env.RAZORPAY_KEYID,
      key_secret: process.env.RAZORPAY_KEYSECRET,
    });
    const amount = 220000;

    rzr.orders.create(
      { amount: +amount, currency: "INR" },
      async (err, order) => {
        if (err) {
          return res.status(400).json(err);
        } else {
          await Order.create({
            orderId: order.id,
            amount: order.amount,
            status: "PENDING",
            userId: req.user.id,
            paymentId: "false",
          });
          return res.status(201).json({ order: order, key_id: rzr.key_id });
        }
      }
    );
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.updateMemberController = async (req, res, next) => {
  const body = req.body;
console.log("update starting")
  try {
    const item = await Order.findOne({
      where: {
        orderId: body.order_id,
      },
    });

    const result = item.update({
      paymentId: body.payment_id,
      status: "SUCCESS",
    });

    const premiumUser = await user.findOne({
      where: {
        id: req.user.id,
      },
    });

    const result2 = premiumUser.update({
      isPremium: "true",
    });

    //we can make it faster by using promise all in place of async await cause they both are working independently and they both are returning promises and not using each other data
    Promise.all([result, result2])
      .then((response) => {
        return res.status(201).json({
          success: true,
          msg: "transaction successful and user is now pro user",
          isPremium: response[1].dataValues.isPremium,
        });
      })
      .catch((err) => {
        console.log(err)
        throw new Error(err);
      });
  } catch (err) {
    return res.status(403).json({ error: err, msg: "something went wrong" });
  }
};

function s3upload(filename, data) {
  return new Promise((resolve, reject) => {
    const bucketName = "fundtracker";
    const IAMuserKey = process.env.IAM_ACCESSKEY;
    const IAMSECRETKEY = process.env.IAM_USER_SECRETKEY;
    let s3bucket = new AWS.S3({
      accessKeyId: IAMuserKey,
      secretAccessKey: IAMSECRETKEY,
    });

    var params = {
      Bucket: bucketName,
      Key: filename,
      Body: data,
      ACL: "public-read",
    };
    s3bucket.upload(params, (err, response) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(response.Location);
      }
    });
  });
}

exports.DownloadReport = async (req, res, next) => {
  try {
    const expense = await Expenses.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const stringifiedExpenses = JSON.stringify(expense);
    const filename = `Expenses${req.user.id}/${new Date()}`;
    const fileUrl = await s3upload(filename, stringifiedExpenses);

    const savedFile = await downloadtable.create({
      fileURL: fileUrl,
      userId: req.user.id,
    });
    // console.log(savedFile);
    return res.status(200).json({ file: fileUrl });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.previousDownloadReport = async (req, res, next) => {
  console.log("routes activated");
  try {
    const previousfile = await downloadtable.findAll({
      where: {
        userId: req.user.id,
      },
    });
    return res.status(200).json({ previousfiles: previousfile });
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};
