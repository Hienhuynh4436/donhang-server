// routes/cleanup.js
const router = require("express").Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({ lastLogin: { $lt: cutoff } });
    res.json({ message: `Đã xoá ${result.deletedCount} user không hoạt động >30 ngày` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá user", error: err });
  }
});

module.exports = router;
