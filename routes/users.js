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
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.code });
    }
  }
);

module.exports = router;
