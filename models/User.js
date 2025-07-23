const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sheetId: { type: String },
  preferences: {
    bgColor: String,
    textColor: String,
    borderColor: String,
    titleColor: String,
    fontFamily: String
  },
  logoUrl: { type: String },
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
