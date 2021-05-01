const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
  },
  roomName: {
    type: String,
  },
  description: {
    type: String,
  },
  maxNumbers: {
    type: Number,
    default: 300,
  },
  visibility: {
    type: String,
  },
  admins: {
    type: [String],
  },
  members: {
    type: [String],
  },
  likeAmount: {
    type: Number,
    default: 0,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

const Room = mongoose.model("Rooms", roomSchema);

module.exports = Room;