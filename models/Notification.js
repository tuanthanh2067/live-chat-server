const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  detail: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  image: {
    type: String,
    default: "",
  },
});

const Notification = mongoose.model("Notifications", notificationSchema);

module.exports = Notification;
