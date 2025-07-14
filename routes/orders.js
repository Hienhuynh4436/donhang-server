const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const router = express.Router();

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

router.post("/", authMiddleware, async (req, res) => {
  const order = new Order({ ...req.body, userId: req.userId });
  await order.save();
  res.json({ message: "Lưu đơn hàng thành công", order });
});

router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort("-createdAt");
  res.json(orders);
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Order.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn để xoá" });
    }
    res.json({ message: "Đã xoá đơn hàng" });
  } catch (err) {
    res.status(500).json({ message: "Xoá thất bại", error: err });
  }
});
module.exports = router;
