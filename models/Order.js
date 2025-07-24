const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerName: String,
  phone: String,
  address: String,
  product: String,
  price: String,
  shippingFee: String,        // ✅ sửa từ shipping
  discount: String,
  paid: String,
  remaining: String,          // ✅ sửa từ remain
  paymentMethod: String,      // ✅ sửa từ method
  sentDate: String,           // ✅ thêm mới
  expectedDate: String,       // ✅ thêm mới
  note: String,
  invoiceImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
