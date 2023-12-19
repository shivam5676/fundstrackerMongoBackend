
const user = require("../../models/user")

const dotenv = require("dotenv");

dotenv.config();


const leaderBoardController = async (req, res, next) => {
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
  module.exports=leaderBoardController