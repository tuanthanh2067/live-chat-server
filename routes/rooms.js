const express = require("express");
const passport = require("passport");
const uniqid = require("uniqid");
const { celebrate, Joi, Segments, errors } = require("celebrate");
const cloudinary = require("cloudinary").v2;

const Room = require("../models/Room");
const User = require("../models/User");

// const { createRoom } = require("../cache");

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
        image:
          "https://res.cloudinary.com/dsqq6qdlf/image/upload/v1619993702/gossip-app/default-room-image.jpg",
      });

      await newRoom.save();

      // create new room in cache
      // createRoom(newRoom.roomId);

      return res.status(200).json(newRoom);
    } catch (err) {
      console.log(err);
      return res
        .status(404)
        .json({ errors: "Problem creating a room, please try again!" });
    }
  }
);

router.get("/get-popular", async (req, res) => {
  try {
    const amount = req.query.amount;
    const page = req.query.page;
    const rooms = await Room.find({})
      .sort({ likeAmount: -1 })
      .limit(-amount)
      .skip(-amount * -page);
    if (!rooms) {
      return res.status(400).json({ errors: "There is currently no rooms" });
    }
    return res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting popular rooms" });
  }
});

router.get("/your-rooms", async (req, res) => {
  try {
    const userId = req.query.userId;
    const amount = req.query.amount;
    const page = req.query.page;

    const rooms = await Room.find({ admins: userId })
      .sort({ likeAmount: -1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!rooms) {
      return res.status(400).json({ errors: "You don't have any rooms yet" });
    }
    return res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting your rooms" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const title = req.query.title;
    const amount = req.query.amount;
    const page = req.query.page;

    const rooms = await Room.find({ roomName: title })
      .sort({ likeAmount: -1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!rooms) {
      return res.status(400).json({ errors: "No rooms found" });
    }

    return res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting rooms" });
  }
});

router.get("/favorite", async (req, res) => {
  try {
    const userId = req.query.userId;
    const amount = req.query.amount;
    const page = req.query.page;

    const rooms = await Room.find({ favorites: userId })
      .sort({ likeAmount: -1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!rooms) {
      return res
        .status(400)
        .json({ errors: "You don't have any favorite rooms" });
    }

    return res.status(200).json(rooms);
  } catch (err) {}
});

router.post("/upload-room-image", async (req, res) => {
  try {
    cloudinary.uploader.upload(req.files[0], function (error, result) {
      console.log(result, error);
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem uploading image" });
  }
});

router.put("/update/:roomId/user", async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.body.userId;

  // check if user is new to the room by user id
  // new -> add to the database
  try {
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Problem finding room" });
    }

    const user = room.members.find((member) => member === userId);

    if (!user) {
      // no user in the room yet
      // add user to the database

      await Room.updateOne({ roomId: roomId }, { $push: { members: userId } });
    }

    const isFav = room.favorites.find((member) => member === userId);
    let isLiked = isFav ? true : false;

    return res.status(200).json({
      maxNumbers: room.maxNumbers,
      members: room.members,
      dateCreated: room.dateCreated,
      roomId: room.roomId,
      roomName: room.roomName,
      description: room.description,
      visibility: room.visibility,
      image: room.image,
      isLiked: isLiked,
      admins: room.admins,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again!" });
  }
});

router.put("/update/:roomId/favorite", async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.body.userId;

  // check if user is new to the room by user id
  // new -> add to the database
  try {
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Problem finding room" });
    }

    const isFav = room.favorites.find((member) => member === userId);
    let isLiked;

    if (!isFav) {
      isLiked = true;
      await Room.updateOne(
        { roomId: roomId },
        { $push: { favorites: userId }, $inc: { likeAmount: 1 } }
      );
    } else {
      isLiked = false;
      await Room.updateOne(
        { roomId: roomId },
        { $pull: { favorites: userId }, $inc: { likeAmount: -1 } }
      );
    }
    return res.status(200).json({
      maxNumbers: room.maxNumbers,
      members: room.members,
      dateCreated: room.dateCreated,
      roomId: room.roomId,
      roomName: room.roomName,
      description: room.description,
      visibility: room.visibility,
      image: room.image,
      isLiked: isLiked,
      admins: room.admins,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again!" });
  }
});

router.use(errors());

module.exports = router;
