

const RazorPay = require("razorpay");
const Order = require("../../models/order");

const dotenv = require("dotenv");

dotenv.config();



const activateMemberController = async (req, res, next) => {
    
    try {
      const rzr = new RazorPay({
        key_id:"rzp_test_hQKSaZFRZsnpbi",
        // process.env.RAZORPAY_KEYID,
        key_secret:"KUzONiDgBg0qYfOdXCkbfAU2",
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
  module.exports=activateMemberController