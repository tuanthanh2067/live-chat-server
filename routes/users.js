const express = require("express");
const passport = require("passport");

const { singleUploadCtrl } = require("../helper/imageUpload");

const {
  getUser,
  getActive,
  getUsers,
  uploadUserImage,
} = require("../controllers/user");

const router = express.Router();

router.get("/user", passport.authenticate("jwt", { session: false }), getUser);

router.get("/active", getActive);

router.get("/get-users", getUsers);

router.post(
  "/upload-image",
  singleUploadCtrl,
  passport.authenticate("jwt", { session: false }),
  uploadUserImage
);

module.exports = router;
