const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uniqid = require("uniqid");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");

const createToken = (id, username, role) => {
  const payload = {
    userId: id,
    userName: username,
    role: role,
  };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: process.env.EXPIRE_IN || "3d" };

  return jwt.sign(payload, secret, options);
};

exports.login = async (req, res) => {
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
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again" });
  }
};

exports.signup = async (req, res) => {
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
      messages: "Sign up successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again" });
  }
};
