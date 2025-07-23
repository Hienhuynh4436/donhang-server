const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyExpires: Date,    
  preferences: {
  bgColor: String,
  textColor: String,
  borderColor: String,
  titleColor: String,
  fontFamily: String
},
  logoUrl: { type: String }, 
  lastLogin: { type: Date, default: Date.now }, 
  resetToken: String,
  resetTokenExpiry: Date
});
module.exports = mongoose.model("User", userSchema);
