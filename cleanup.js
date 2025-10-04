// cleanup.js — dọn dẹp user không hoạt động an toàn
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/User");

async function deleteInactiveUsers() {
  try {
    console.log("🚀 Bắt đầu kiểm tra user không hoạt động...");

    // Ngưỡng thời gian 30 ngày trước
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Tìm các user có lastLogin tồn tại và nhỏ hơn cutoff, và KHÔNG phải admin
    const usersToDelete = await User.find({
      lastLogin: { $exists: true, $lt: cutoff },
      role: { $ne: "admin" } // Nếu bạn không có role admin, có thể bỏ dòng này
    });

    if (usersToDelete.length === 0) {
      console.log("✅ Không có tài khoản nào cần xoá.");
      return;
    }

    console.log(`⚠️ Tìm thấy ${usersToDelete.length} user không hoạt động >30 ngày:`);
    usersToDelete.forEach(u => console.log(` - ${u.email} (lastLogin: ${u.lastLogin})`));

    // Xoá thật sự
    const result = await User.deleteMany({
      lastLogin: { $exists: true, $lt: cutoff },
      role: { $ne: "admin" }
    });

    console.log(`🗑️ Đã xoá ${result.deletedCount} tài khoản.`);
  } catch (err) {
    console.error("❌ Lỗi xoá user:", err);
  }
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Đã kết nối MongoDB");
    await deleteInactiveUsers();
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
