const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const { appendToGoogleSheet } = require("../google-sheets");

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

// ✅ Tạo đơn hàng và lưu Google Sheet
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.sheetId) {
      return res.status(400).json({ message: "❗ Người dùng chưa cấu hình Google Sheet" });
    }

    // Lưu vào MongoDB
    const order = new Order({ userId: req.userId, ...req.body });
    await order.save();

    // Chuẩn bị dữ liệu lưu vào Google Sheets
    const fields = [
      'customerName', 'phone', 'address', 'product', 'price',
      'shippingFee', 'discount', 'paid', 'remaining', 'paymentMethod',
      'sentDate', 'expectedDate', 'note'
    ];
    const data = fields.map(f => {
  if (f === "phone") {
    return "'" + (req.body[f] || ""); // giữ số 0
  }
  return req.body[f] || "";
});

    // Ghi vào Google Sheet
    await appendToGoogleSheet(user.sheetId, data, {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    });

    res.json({ message: "✅ Đã lưu đơn hàng vào Google Sheet", order });
  } catch (err) {
    console.error("❌ Lỗi lưu đơn:", err);
    res.status(500).json({ message: "❌ Lỗi server", error: err.message });
  }
});

// 📋 Lấy danh sách đơn hàng
router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort("-createdAt");
  res.json(orders);
});

// 🗑 Xoá đơn hàng
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Order.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn để xoá" });
    }
    res.json({ message: "✅ Đã xoá đơn hàng" });
  } catch (err) {
    res.status(500).json({ message: "❌ Xoá thất bại", error: err.message });
  }
});

module.exports = router;
