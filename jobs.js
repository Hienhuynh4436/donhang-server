// jobs.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

async function deleteInactiveUsers() {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({ lastLogin: { $lt: cutoff } });
    console.log(`🗑️ [Jobs] Đã xoá ${result.deletedCount} tài khoản không hoạt động >30 ngày`);
  } catch (err) {
    console.error("❌ Lỗi khi xoá user inactive:", err);
  }
}

// Kết nối database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Jobs connected to MongoDB");
    deleteInactiveUsers();  // chạy ngay khi server khởi động
    setInterval(deleteInactiveUsers, 24 * 60 * 60 * 1000);  // sau đó mỗi 24h chạy lại
  })
  .catch(err => console.error("❌ Jobs MongoDB error:", err));
