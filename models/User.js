const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
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
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
