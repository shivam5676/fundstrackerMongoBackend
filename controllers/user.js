const expense = require("../models/expense");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RazorPay = require("razorpay");
const Order = require("../models/order");
const user = require("../models/user");

function tokenmaker(id, name) {
  console.log(id, name);
  const secretkey = "1234abcdefg";
  return jwt.sign({ userId: id, name: name }, secretkey);
}

exports.loginController = async (req, res, next) => {
  const data = req.body;
  try {
    const savedUser = await user.findOne({
      where: {
        email: data.email,
      },
    });
    console.log(savedUser);
    if (savedUser === null) {
      return res
        .status(404)
        .json({ msg: "user does not exist with this email id" });
    }
    try {
      const comparedHashPassword = await bcrypt.compare(
        data.password,
        savedUser.password
      );
      console.log("compare", comparedHashPassword);
      if (comparedHashPassword === true) {
        console.log("execute", savedUser.id, savedUser.name);
        return res.status(200).json({
          msg: "Account successfully loggined",
          token: tokenmaker(savedUser.id, savedUser.name),
          premium: savedUser.isPremium,
        });
      } else {
        return res.status(401).json({ msg: "Incorrect password" });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ msg: "Error during password verification" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.signupController = async (req, res, next) => {
  const data = req.body;
  // Unique account validation by email
  try {
    const response = await user.findAll({
      where: {
        email: data.email,
      },
    });
    if (response.length === 0) {
      const saltrounds = 10;

      try {
        //we using a different try catch block only for getting error related to hasing process
        // Attempt to hash the password
        const encryptedPassword = await bcrypt.hash(data.password, saltrounds);

        // If hashing is successful, create the user
        const signupResponse = await user.create({
          name: data.name,
          password: encryptedPassword,
          email: data.email,
          isPremium: "false",
          totalExpense: 0,
        });

        return res.status(200).json({ msg: "Account successfully created" });
      } catch (hashingError) {
        console.error("Error during password hashing:", hashingError);
        return res
          .status(500)
          .json({ msg: "Error creating the account. Please try again later." });
      }
    } else {
      return res.status(401).json({
        msg: "An account with the same email id is present. Please try with another email id.",
      });
    }
  } catch (err) {
    console.error("Error during account validation:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};
exports.addExpenseController = (req, res, next) => {
  const item = req.body;
  console.log("executed");
  expense
    .create({
      amount: item.amount,
      category: item.category,
      description: item.description,

      userId: req.user.id,
    })
    .then((result) => {
      user.findOne({
        where: {
          id: req.user.id,
        },
      }).then(response=>{
        console.log(response.totalExpense)
        response.update({
          totalExpense:response.totalExpense+item.amount
        })
        
        return res.status(200).json({ msg: "data added successfully" ,response})
      })
      
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getExpenseController = (req, res, next) => {
  expense
    .findAll({
      where: {
        userId: req.user.id,
      },
    })
    .then((result) => {
      console.log(result);
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteExpenseController = async (req, res, next) => {
  const delId = req.body.id;
  try {
    const result = await expense.findOne({
      where: {
        id: delId,

        userId: req.user.id,
      },
    });
    await result.destroy();
    return res.status(200).json({ msg: "data deleted successfully" });
  } catch (err) {
    console.log(err);
  }
};
exports.activateMemberController = async (req, res, next) => {
  console.log("req successfully recived", req.user);
  try {
    const rzr = new RazorPay({
      key_id: "rzp_test_87n9BwUziKZrYv",
      key_secret: "VJOq6QhtFJwX0QGCBVy5EYFd",
    });
    const amount = 220000;

    rzr.orders.create(
      { amount: amount, currency: "INR" },
      async (err, order) => {
        if (err) {
          throw new Error(err);
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
        throw new Error(err);
      });
  } catch (err) {
    return res.status(403).json({ error: err, msg: "something went wrong" });
  }
};

exports.leaderBoardController = async (req, res, next) => {
  const leaderboardData = {};
  console.log(req.user);
  try {



const result = await user.findAll();

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
    console.log(err);
  }
};
