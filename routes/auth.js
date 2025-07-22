const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// Hàm gửi email xác minh
async function sendVerifyEmail(email, link) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Đơn Hàng" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Xác minh tài khoản",
    html: `
      <h3>Xác minh tài khoản của bạn</h3>
      <p>Bạn đã đăng ký tài khoản. Vui lòng nhấn vào liên kết dưới đây để xác minh:</p>
      <a href="https://hienxacminh@gmail.com/verify?token=${link}&email=${encodeURIComponent(email)}">Xác minh tài khoản</a>
      <p>Liên kết sẽ hết hạn sau 24 giờ.</p>
    `
  });
}

// 📌 Đăng ký người dùng + gửi mail xác minh
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

  const hashed = await bcrypt.hash(password, 10);

  // Sinh verifyToken + hạn dùng
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = new User({
    email,
    password: hashed,
    verifyToken,
    verifyExpires,
    isVerified: false
  });

  await user.save();

  // Gửi email xác minh
  const verifyLink = verifyToken;
  await sendVerifyEmail(email, verifyLink);

  res.json({
    message: "✅ Tạo tài khoản thành công. Vui lòng kiểm tra email để xác minh."
  });
});

// 📌 Đăng nhập (chặn nếu chưa xác minh)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email không đúng" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Mật khẩu không đúng" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Tài khoản chưa được xác minh" });

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

module.exports = router;
