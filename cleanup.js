const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/User");

async function deleteInactiveUsers() {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({ lastLogin: { $lt: cutoff } });
    console.log(`🗑️ Đã xoá ${result.deletedCount} tài khoản không hoạt động >30 ngày`);
  } catch (err) {
    console.error("❌ Lỗi xoá user:", err);
  }
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Đã kết nối MongoDB");
    await deleteInactiveUsers();
    process.exit(); // ⛔ kết thúc tiến trình
  })
  .catch(err => console.error("❌ MongoDB lỗi:", err));
