const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const result = await User.updateMany(
      {
        $or: [
          { isVerified: false },
          { isVerified: { $exists: false } }
        ]
      },
      { $set: { isVerified: true } }
    );

    res.json({
      message: `✅ Đã xác minh ${result.modifiedCount} tài khoản (bao gồm cả thiếu trường)`
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi xác minh", error: err });
  }
});

module.exports = router;
