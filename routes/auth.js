const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email đã tồn tại" });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed });
  await user.save();
  res.json({ message: "Tạo tài khoản thành công" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email không đúng" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Mật khẩu không đúng" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, logoUrl: user.logoUrl });
});
const Order = require("../models/Order");

router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    await Order.deleteMany({ userId: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Đã xoá tài khoản và toàn bộ đơn hàng" });
  } catch (err) {
    res.status(500).json({ message: "Xoá thất bại", error: err });
  }
});
module.exports = router;
