const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  filename: String,
  filePath: String,
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  address: String,
  userType: {
    type: String,
    default: "user",
  },
  profileImage: [attachmentSchema],
});

module.exports = mongoose.model("User", userSchema);
