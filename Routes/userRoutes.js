const express = require("express");

const router = express.Router();

const controller = require("../controllers/user");
const authentication = require("../middleware/auth");

router.post("/login", controller.loginController);
router.post("/signup", controller.signupController);
router.post("/addexpense", authentication, controller.addExpenseController);
router.get("/getexpense", authentication, controller.getExpenseController);
router.post(
  "/deleteexpense",
  authentication,
  controller.deleteExpenseController
);

module.exports = router;
