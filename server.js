const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

const { createRoom, addMessage, messages } = require("./cache");
const {
  addUser,
  getUser,
  deleteUser,
  getTotalClientOfARoomById,
} = require("./users");

const app = require("./app");
const { create } = require("./models/User");
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const wsServerOptions = {
  cors: {
    origin: "*",
    methods: ["GET"],
  },
};

const io = new Server(httpServer, wsServerOptions);

mongoose
  .connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // listen on port 5000
    httpServer.listen(PORT);
  })
  .catch((err) => {
    console.log("unable to start the server" + err);
    process.exit();
  });

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

io.on("connection", (socket) => {
  socket.userId = "";

  socket.on("switchRoom", ({ id, name, newRoom }) => {
    socket.userId = id;
    let user = getUser(socket.userId);

    if (user) {
      // already in a room
      // leave the room
      socket.leave(user.room);

      socket.to(user.room).emit("notification", {
        title: `${user.name} just left the room`,
      });

      user.room = newRoom;
    } else {
      user = addUser(socket.userId, name, newRoom);
    }

    socket.join(newRoom);
    socket.currentRoom = newRoom;

    io.in(newRoom).emit("notification", {
      title: `${user.name} just entered the room`,
    });
  });

  socket.on("sendMessage", ({ chat }) => {
    const user = getUser(socket.userId);

    addMessage(user.name, chat, user.room);

    io.in(user.room).emit("message", { name: user.name, text: chat });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    const user = deleteUser(socket.userId);

    if (user) {
      socket.to(user.room).emit("notification", {
        title: `${user.name} just left the room`,
      });
    }

    socket.offAny();
  });

  socket.on("count", ({ roomId }) => {
    io.in(roomId).emit("count", { clients: getTotalClientOfARoomById(roomId) });
  });

  socket.on("init", ({ roomId }) => {
    socket.to(roomId).emit("init", { messages: messages(socket.roomId) });
  });
});
