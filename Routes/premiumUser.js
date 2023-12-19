const express = require("express");

const router = express.Router();

// const controller = require("../controllers/premiumUser");
const authentication = require("../middleware/auth");
const leaderBoardController = require("../controllers/premiumUser/leaderboardController");
const updateMemberController = require("../controllers/premiumUser/updateMemberController");
const activateMemberController = require("../controllers/premiumUser/activateMembership");
const DownloadReport = require("../controllers/premiumUser/downLoadReportController");
const previousDownloadReport = require("../controllers/premiumUser/previousDownloadReport");

router.get("/leaderboard",authentication,leaderBoardController)
router.post("/updateMembership",authentication,updateMemberController)
router.get("/activateMembership",authentication,activateMemberController)
router.get("/downloadexpense",authentication,DownloadReport)
router.get("/previousdownloadexpense",authentication,previousDownloadReport)
module.exports = router;