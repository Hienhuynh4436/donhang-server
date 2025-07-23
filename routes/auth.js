const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// 📌 Đăng ký người dùng KHÔNG cần xác minh
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashed,
    isVerified: true // ✅ Cho phép luôn
  });

  await user.save();
  res.json({ message: "✅ Tạo tài khoản thành công" });
});

// 📌 Đăng nhập
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email không đúng" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Mật khẩu không đúng" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  user.lastLogin = new Date();
  await user.save();
  res.json({ token, logoUrl: user.logoUrl });
});

// Middleware xác thực token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.id;
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
}

// 📌 Xoá tài khoản + đơn hàng
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    await Order.deleteMany({ userId: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Đã xoá tài khoản và toàn bộ đơn hàng" });
  } catch (err) {
    res.status(500).json({ message: "Xoá thất bại", error: err });
  }
});

// 📌 Quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email không tồn tại" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.BASE_URL}/reset-password.html?token=${token}&email=${email}`;

  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });

  await transporter.sendMail({
    from: `"Đơn Hàng" <${process.env.SEND_EMAIL}>`,
    to: email,
    subject: "Khôi phục mật khẩu",
    html: `<p>Click vào link sau để đặt lại mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`
  });

  res.json({ message: "✅ Đã gửi email khôi phục" });
});

// 📌 Đặt lại mật khẩu
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "✅ Mật khẩu đã được đặt lại" });
});

module.exports = router;
