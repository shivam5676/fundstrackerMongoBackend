const express = require("express");

const router = express.Router();

const controller = require("../controllers/premiumUser");
const authentication = require("../middleware/auth");

router.get("/leaderboard",authentication,controller.leaderBoardController)
router.post("/updateMembership",authentication,controller.updateMemberController)
router.get("/activateMembership",authentication,controller.activateMemberController)
router.get("/downloadexpense",authentication,controller.DownloadReport)
router.get("/previousdownloadexpense",authentication,controller.previousDownloadReport)
module.exports = router;