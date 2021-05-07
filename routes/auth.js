const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const uniqid = require("uniqid");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const User = require("../models/User");

dotenv.config();
const router = express.Router();

function createToken(id, username, role) {
  const payload = {
    userId: id,
    userName: username,
    role: role,
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
        token: createToken(user.userId, user.userName, user.role),
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
      email: Joi.string().email().required().messages({
        "string.base": "Email should be a type of string",
        "string.empty": "Email could not be empty",
        "any.required": "Email is a required field",
      }),
      password: Joi.string().min(7).max(30).required().messages({
        "string.base": "Password should be a type of string",
        "string.empty": "Password could not be empty",
        "string.min": "Password should have at least 7 characters",
        "string.max": "Password should have at most 30 characters",
        "any.required": "Password is a required field",
      }),
      confirmPassword: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Password does not match",
        }),
      userName: Joi.string().min(7).max(30).required().messages({
        "string.base": "User name should be a type of string",
        "string.empty": "User name could not be empty",
        "string.min": "User name should have at least 7 characters",
        "string.max": "User name should have at most 30 characters",
        "any.required": "User name is a required field",
      }),
    }),
  }),
  async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ errors: "Email has been registered" });
      }

      user = await User.findOne({ userName: req.body.userName });

      if (user) {
        return res.status(400).json({ errors: "User name has been taken" });
      }

      const password = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        password: password,
        userName: req.body.userName,
        userId: uniqid(),
        image:
          "https://res.cloudinary.com/dsqq6qdlf/image/upload/v1620338374/gossip-app/default-user-image.jpg",
      });

      await newUser.save();

      return res.status(200).json({
        message: "Sign up successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(404).json({ errors: err.message });
    }
  }
);

router.use(errors());

module.exports = router;
