const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;

const Room = require("../models/Room");
const User = require("../models/User");

exports.createRoom = async (req, res) => {
  try {
    // req.user
    const user = req.user;
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
      password: req.body.password,
      admins: [user.userId],
      members: [user.userId],
      creator: user.userId,
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
};

exports.getPopular = async (req, res) => {
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
};

exports.yourRooms = async (req, res) => {
  try {
    const userId = req.user.userId;
    const amount = req.query.amount;
    const page = req.query.page;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

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
};

exports.searchRoom = async (req, res) => {
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
};

exports.favoriteRooms = async (req, res) => {
  try {
    const userId = req.user.userId;
    const amount = req.query.amount;
    const page = req.query.page;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

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
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting favorite rooms" });
  }
};

exports.roomById = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findOne({ roomId: id });

    if (!room) {
      return res.status(400).json({ errors: `Can not find the room id ${id}` });
    }

    return res.status(200).json({
      maxNumbers: room.maxNumbers,
      admins: room.admins,
      members: room.members,
      favorites: room.favorites,
      likeAmount: room.likeAmount,
      dateCreated: room.dateCreated,
      _id: room._id,
      roomId: room.roomId,
      roomName: room.roomName,
      description: room.description,
      visibility: room.visibility,
      creator: room.creator,
      image: room.image,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting the room" });
  }
};

exports.uploadRoomImage = async (req, res) => {
  try {
    cloudinary.uploader.upload(req.files[0], function (error, result) {
      console.log(result, error);
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem uploading image" });
  }
};

exports.updateRoomUser = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    // check if user is new to the room by user id
    // new -> add to the database
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Problem finding room" });
    }

    if (room.members.length >= room.maxNumbers) {
      return res.status(400).json({ errors: "The room is full" });
    }

    const member = room.members.find((member) => member === userId);

    if (!member) {
      // no user in the room yet
      // add user to the database

      await Room.updateOne({ roomId: roomId }, { $push: { members: userId } });
    }

    return res.status(200).json({
      messages: "Update successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again!" });
  }
};

exports.roomIsLiked = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Problem finding room" });
    }

    const isFav = room.favorites.find((member) => member === userId);
    let isLiked = isFav ? true : false;

    return res.json(isLiked);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again!" });
  }
};

exports.updateRoomFavorite = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    // check if user is new to the room by user id
    // new -> add to the database
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
    return res.status(200).json(isLiked);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ errors: "An error has been detected, please try again!" });
  }
};

exports.updateRoomAdmin = async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;
    const newAdminId = req.body.userId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Can not find the room" });
    }

    if (room.creator !== userId) {
      // this person is not the creator of this room
      return res
        .status(400)
        .json({ errors: "You're not authorized to add admins" });
    }

    // check if new admin id exists
    const newAdmin = await User.findOne({ userId: newAdminId });
    if (!newAdmin) {
      return res.status(400).json({ errors: "User id does not exist" });
    }

    // check if new admin is already an admin or not
    if (room.admins.includes(newAdminId)) {
      return res.status(400).json({ errors: "Already an admin" });
    }

    if (room.creator === userId) {
      // this person is a creator
      // so they can add admins or members
      await Room.updateOne(
        { roomId: roomId },
        { $push: { admins: newAdminId } }
      );

      // if the person is not in the room yet
      // also add them to member array
      if (!room.members.includes(newAdminId)) {
        await Room.updateOne(
          { roomId: roomId },
          { $push: { members: newAdminId } }
        );
      }

      return res.status(200).json({ messages: "A new admin has been added" });
    }
    return res
      .status(400)
      .json({ errors: "You're not authorized to add admins" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Error detected, please try again" });
  }
};

exports.updateRoomMember = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const newMemberId = req.body.userId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Can not find the room" });
    }

    // check if new member id exists
    const newMember = await User.findOne({ userId: newMemberId });
    if (!newMember) {
      return res.status(400).json({ errors: "User id does not exist" });
    }

    // check if new member is already a member or not
    if (room.members.includes(newMemberId)) {
      return res.status(400).json({ errors: "Already a member" });
    }

    if (room.admins.includes(userId) || room.creator === userId) {
      // this person is an admin or room creator
      // so they can add members
      await Room.updateOne(
        { roomId: roomId },
        { $push: { members: newMemberId } }
      );

      return res.status(200).json({ messages: "A new member has been added" });
    }
    return res
      .status(400)
      .json({ errors: "You're not authorized to add members" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Error detected, please try again" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;

    const user = req.user;
    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(400).json({ errors: "Can not find the room" });
    }

    if (room.creator !== userId) {
      // not a creator of this room
      // not allowed to delete
      return res
        .status(400)
        .json({ errors: "You're not authorized to delete this room" });
    }

    await Room.deleteOne({ roomId: roomId });
    return res.status(200).json({ messages: "Delete successfully" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Error detected, please try again" });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.params.id;

    if (!req.user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    const room = await Room.findOne({ roomId: id });

    if (room.visibility === "public") {
      return res.status(200);
    } else if (room.visibility === "private" && room.password === password) {
      return res.status(200).json({ messages: "Join successfully" });
    } else {
      return res
        .status(400)
        .json({ errors: "Wrong password, please try again" });
    }
  } catch {
    console.log(err);
    return res.status(404).json({ errors: "Error detected, please try again" });
  }
};
