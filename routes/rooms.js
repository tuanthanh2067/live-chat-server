const express = require("express");
const passport = require("passport");
const uniqid = require("uniqid");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const Room = require("../models/Room");
const User = require("../models/User");

const { createRoom } = require("../cache");

const router = express.Router();

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      description: Joi.string().required().messages({
        "string.base": "Description should be a string",
        "string.empty": "Description could not be empty",
        "any.required": "Description is a required field",
      }),
      name: Joi.string().required().messages({
        "string.base": "Room name should be a string",
        "string.empty": "Room name could not be empty",
        "any.required": "Room name is a required field",
      }),
      max: Joi.number().integer().min(1).max(300).messages({
        "number.base": "Maximum members field must be a number",
        "number.min": "Members must be greater than 0",
        "number.max": "Members must be smaller than 300",
      }),
      visibility: Joi.string().valid("public", "private").required().messages({
        "string.base": "Visibility should be a string",
        "string.empty": "Visibility could not be empty",
        "any.required": "Visibility is a required field",
        "string.valid": "Visibility has invalid option",
      }),
    }),
  }),
  async (req, res) => {
    try {
      // req.user
      const user = await User.findOne({ userId: req.user.userId });
      if (!user) {
        return res.status(400).json({ errors: "User is not valid" });
      }

      // req.body {description, max, name, visibility}
      const newRoom = new Room({
        roomId: uniqid(),
        roomName: req.body.name,
        description: req.body.description,
        maxNumbers: req.body.max,
        visibility: req.body.visibility,
        admins: [user.userId],
        members: [user.userId],
      });

      await newRoom.save();

      // create new room in cache
      createRoom(newRoom.roomId);

      return res.status(200).json(newRoom);
    } catch (err) {
      console.log(err);
      return res.status(404).json({ errors: err.code });
    }
  }
);

router.get("/get-popular", async (req, res) => {
  const rooms = await Room.find({}).sort({ likeAmount: 1 }).limit(20);
  if (!rooms) {
    return res.json({ message: "There is currently no rooms" });
  }

  return res.status(200).json(rooms);
});

router.use(errors());

module.exports = router;
