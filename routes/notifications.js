const express = require("express");
const passport = require("passport");

const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ messages: "Notification's here" });
});

module.exports = router;
