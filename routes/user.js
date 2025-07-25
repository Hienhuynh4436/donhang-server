const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Middleware kiểm tra token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
}

// ✅ Lấy thông tin người dùng đang đăng nhập
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId, "email preferences logoUrl lastLogin");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});
// ✔️ Lưu sheet ID người dùng
router.put("/sheet", authMiddleware, async (req, res) => {
  const { sheetId } = req.body;
  if (!sheetId) return res.status(400).json({ message: "Sheet ID trống" });
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    user.sheetId = sheetId;
    await user.save();
    res.json({ message: "✅ Sheet ID đã lưu", sheetId });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
// ✅ Lấy preferences riêng (đơn giản hơn nếu chỉ muốn lấy preferences)
router.get("/preferences", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
  res.json(user.preferences || {});
});

// ✅ Cập nhật preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  const { bgColor, textColor, borderColor, titleColor, fontFamily } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    user.preferences = { bgColor, textColor, borderColor, titleColor, fontFamily };
    await user.save();
    res.json({ message: "Đã cập nhật preferences", preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});

module.exports = router;
