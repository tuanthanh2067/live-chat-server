const express = require("express");
const passport = require("passport");
const { celebrate, Joi, Segments, errors } = require("celebrate");

const {
  createRoom,
  getPopular,
  yourRooms,
  searchRoom,
  favoriteRooms,
  roomById,
  uploadRoomImage,
  updateRoomUser,
  roomIsLiked,
  updateRoomFavorite,
  updateRoomAdmin,
  updateRoomMember,
  deleteRoom,
  joinRoom,
} = require("../controllers/rooms");

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
      password: Joi.string().required().messages({
        "string.base": "Password should be a string",
        "string.empty": "Password could not be empty",
        "any.required": "Password is a required field",
      }),
    }),
  }),
  createRoom
);

router.get("/get-popular", getPopular);

router.get(
  "/your-rooms",
  passport.authenticate("jwt", { session: false }),
  yourRooms
);

router.get("/search", searchRoom);

router.get(
  "/favorite",
  passport.authenticate("jwt", { session: false }),
  favoriteRooms
);

router.get("/:id", roomById);

router.post("/upload-room-image", uploadRoomImage);

router.put(
  "/update/:roomId/user",
  passport.authenticate("jwt", { session: false }),
  updateRoomUser
);

router.get(
  "/:roomId/isLiked",
  passport.authenticate("jwt", { session: false }),
  roomIsLiked
);

router.put(
  "/update/:roomId/favorite",
  passport.authenticate("jwt", { session: false }),
  updateRoomFavorite
);

// add admin to room
// only room creator can add admin
router.put(
  "/update/:roomId/admin",
  passport.authenticate("jwt", { session: false }),
  updateRoomAdmin
);

// add members to room
// admin or room creator can add members
router.put(
  "/update/:roomId/member",
  passport.authenticate("jwt", { session: false }),
  updateRoomMember
);

router.delete(
  "/:roomId",
  passport.authenticate("jwt", { session: false }),
  deleteRoom
);

router.post(
  "/:id/join",
  passport.authenticate("jwt", { session: false }),
  joinRoom
);

router.use(errors());

module.exports = router;
