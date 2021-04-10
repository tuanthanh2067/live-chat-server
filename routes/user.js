const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const uniqid = require("uniqid");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const User = require("../models/User");

const app = express();

dotenv.config();
const router = express.Router();

function createToken(id, username) {
  const payload = {
    id: id,
    userName: username,
  };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: process.env.EXPIRE_IN || "3d" };

  return jwt.sign(payload, secret, options);
}

router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ errors: "Invalid Credentials" });
    }

    let isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch === true) {
      return res.status(200).json({
        token: createToken(user.id, user.name),
      });
    } else {
      return res.status(400).json({ errors: "Invalid Credentials" });
    }
  } catch (err) {
    return res.status(404).json({ errors: err.message });
  }
});

router.post(
  "/signup",
  // check form validation
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(7).max(30).required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      userName: Joi.string().min(7).max(30).required(),
    }),
  }),
  async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ errors: "Email has been registered" });
      }

      const password = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        password: password,
        userName: req.body.userName,
        id: uniqid(),
      });

      await newUser.save();

      return res.status(200).json({
        message: "Sign up successfully",
      });
    } catch (err) {
      return res.status(404).json({ errors: err.message });
    }
  }
);

router.use(errors());

module.exports = router;
