const dotenv = require("dotenv");

const downloadtable = require("../../models/downloadUrl");
dotenv.config();

const previousDownloadReport = async (req, res, next) => {
  // console.log("routes activated");
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
module.exports = previousDownloadReport;
