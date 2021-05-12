const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const DataURIParser = require("datauri/parser");
const parser = new DataURIParser();

const User = require("../models/User");

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const formatBufferTo64 = (file) =>
  parser.format(path.extname(file.originalname).toString(), file.buffer);

const cloudinaryUpload = (file) =>
  cloudinary.uploader.upload(file, { folder: "gossip-app/" });

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not supported file type!"), false);
    }
  },
});

const singleUpload = upload.single("image");
const singleUploadCtrl = (req, res, next) => {
  singleUpload(req, res, (error) => {
    if (error) {
      return res.status(422).send({ message: "Image upload fail!" });
    }
    next();
  });
};

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
      return res.status(422).send({ errors: e.message });
    }
  }
);

module.exports = router;
