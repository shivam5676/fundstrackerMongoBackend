
const Order = require("../../models/order");
const user = require("../../models/user");

const dotenv = require("dotenv");

dotenv.config();



const updateMemberController = async (req, res, next) => {
      const body = req.body;
  
      try {
        const item = await Order.findOne({
          
            orderId: body.order_id,
          
        });
    
        const result = item.updateOne({
          paymentId: body.payment_id,
          status: "SUCCESS",
        });
    
        const premiumUser = await user.findOne({
         
            _id: req.user.id,
        
        });
    
        const result2 = premiumUser.updateOne({
          isPremium: "true",
        });
    
        //we can make it faster by using promise all in place of async await cause they both are working independently and they both are returning promises and not using each other data
        Promise.all([result, result2])
          .then((response) => {
          
            return res.status(201).json({
              success: true,
              msg: "transaction successful and user is now pro user",
              isPremium:"true" ,
            });
          })
          .catch((err) => {
            
            throw new Error(err);
          });
      } catch (err) {
        return res.status(403).json({ error: err, msg: "something went wrong" });
      }
    };
    module.exports=updateMemberController