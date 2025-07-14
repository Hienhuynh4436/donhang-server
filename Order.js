const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerName: String,
  phone: String,
  address: String,
  product: String,
  price: String,
  shipping: String,
  discount: String,
  paid: String,
  remain: String,
  method: String,
  note: String,
  invoiceImage: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Order", orderSchema);