
const Order = require("../../models/order");
const user = require("../../models/user");

const dotenv = require("dotenv");

dotenv.config();



const updateMemberController = async (req, res, next) => {
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
    module.exports=updateMemberController