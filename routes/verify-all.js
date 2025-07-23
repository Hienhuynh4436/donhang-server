// routes/verify-all.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const result = await User.updateMany(
      { isVerified: false },
      {
        $set: { isVerified: true },
        $unset: { verifyToken: "", verifyExpires: "" }
      }
    );
    res.json({ message: `Đã xác minh ${result.modifiedCount} tài khoản!` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xác minh tất cả", error: err });
  }
});

module.exports = router;
