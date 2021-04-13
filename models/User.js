const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  userName: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    default: "user",
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
