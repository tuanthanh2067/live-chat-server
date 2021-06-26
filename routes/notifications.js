const express = require("express");
const passport = require("passport");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const {
  getNotifications,
  addNotifications,
} = require("../controllers/notifications");

const { singleUploadCtrl } = require("../helper/imageUpload");

const router = express.Router();

router.get("/", getNotifications);

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
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
  singleUploadCtrl,
  addNotifications
);

router.use(errors());

module.exports = router;
