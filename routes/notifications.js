const express = require("express");
const passport = require("passport");

const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const amount = req.query.amount;
    const page = req.query.page;

    const notifications = await Notification.find({})
      .sort({ dateCreated: -1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!notifications) {
      return res.status(400).json({ errors: "No notifications found" });
    }

    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting notifications" });
  }
});

module.exports = router;
