// file: routes/verify-all.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const result = await User.updateMany(
      { isVerified: false },
      { $set: { isVerified: true } }
    );
    res.json({ message: `✅ Updated ${result.modifiedCount} users` });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi", error: err });
  }
});

module.exports = router;
