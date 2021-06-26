const express = require("express");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const { login, signup } = require("../controllers/auth");

const router = express.Router();

router.post("/login", login);

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
  signup
);

router.use(errors());

module.exports = router;
