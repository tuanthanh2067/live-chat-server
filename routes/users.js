const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");

const User = require("../models/User");

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
      return res.status(500).json({ error: err.code });
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

module.exports = router;
