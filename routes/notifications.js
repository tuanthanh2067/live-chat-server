const express = require("express");
const passport = require("passport");
const uniqid = require("uniqid");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const Notification = require("../models/Notification");
const User = require("../models/User");

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

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required().messages({
        "string.base": "Title should be a string",
        "string.empty": "Title could not be empty",
        "any.required": "Title is a required field",
      }),
      description: Joi.string().required().messages({
        "string.base": "Description should be a string",
        "string.empty": "Description could not be empty",
        "any.required": "Description is a required field",
      }),
      detail: Joi.string().required().messages({
        "string.base": "Detail should be a string",
        "string.empty": "Detail could not be empty",
        "any.required": "Detail is a required field",
      }),
    }),
  }),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await User.findOne({ userId: userId });

      if (!user) {
        return res.status(400).json({ errors: "User is not valid" });
      }

      if (user.role !== "admin") {
        return res
          .status(400)
          .json({ errors: "You're not authorized to add a notification" });
      }

      const newNotification = new Notification({
        notificationId: uniqid(),
        title: req.body.title,
        description: req.body.description,
        detail: req.body.detail,
      });

      await newNotification.save();

      return res.status(200).json(newNotification);
    } catch (err) {
      console.log(err);
      return res.status(404).json({ errors: "Problem adding notification" });
    }
  }
);

module.exports = router;
