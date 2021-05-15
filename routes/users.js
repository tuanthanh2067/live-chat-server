const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");

const User = require("../models/User");

const {
  formatBufferTo64,
  cloudinaryUpload,
  singleUploadCtrl,
} = require("../helper/imageUpload");

dotenv.config();
const router = express.Router();

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user = await User.findOne({ userId: req.user.userId });
      if (!user) {
        return res.status(400).json({ errors: "Can not find the user" });
      }

      return res.status(200).json({
        role: user.role,
        dateCreated: user.dateCreated,
        userName: user.userName,
        userId: user.userId,
        image: user.image,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(404)
        .json({ errors: "An error has been detected, please try again" });
    }
  }
);

router.get("/active", async (req, res) => {
  const amount = req.query.amount;
  const page = req.query.page;
  try {
    const users = await User.find(
      {},
      { role: 1, dateCreated: 1, _id: 0, userName: 1, userId: 1, image: 1 }
    )

      .sort({ dateCreated: 1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!users) {
      return res
        .status(400)
        .json({ errors: "There is currently no gossipers" });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting active gossipers" });
  }
});

router.get("/get-users", async (req, res) => {
  try {
    const users = req.query.users.split(",");
    if (users.length === 0) {
      return res.status(400).json({ errors: "There is no users found" });
    }
    const results = await User.find({ userId: { $in: users } });
    return res.status(200).json(results);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting users" });
  }
});

router.post(
  "/upload-image",
  singleUploadCtrl,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      if (!req.file) {
        return res.status(400).json({ errors: "Incorrect image type" });
      }
      const file64 = formatBufferTo64(req.file);

      const uploadResult = await cloudinaryUpload(file64.content);
      await User.updateOne(
        { userId: userId },
        { image: uploadResult.secure_url }
      );
      return res.status(200).json({ messages: "Upload successfully" });
    } catch (e) {
      return res
        .status(422)
        .send({ errors: "An error has been detected, please try again" });
    }
  }
);

module.exports = router;
