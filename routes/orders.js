const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
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

// ✅ Tạo đơn hàng và chỉ lưu vào Google Sheet
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.sheetId) {
      return res.status(400).json({ message: "❗ Người dùng chưa cấu hình Google Sheet" });
    }

    // Chuẩn bị dữ liệu để ghi vào Google Sheet
    const fields = [
      'customerName', 'phone', 'address', 'product', 'price',
      'shippingFee', 'discount', 'paid', 'remaining', 'paymentMethod',
      'sentDate', 'expectedDate', 'note'
    ];

    const data = fields.map(f => {
      const val = req.body[f] || "";
      return f === "phone" ? "'" + val : val; // giữ số 0
    });

    // Ghi vào Google Sheet
    await appendToGoogleSheet(user.sheetId, data, {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    });

    res.json({ message: "✅ Đã lưu đơn hàng vào Google Sheet" });
  } catch (err) {
    console.error("❌ Lỗi lưu đơn:", err);
    res.status(500).json({ message: "❌ Lỗi server", error: err.message });
  }
});

module.exports = router;
