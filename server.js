const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

// const { createRoom, addMessage, messages } = require("./cache");
const {
  addUser,
  getUser,
  deleteUser,
  getTotalClientOfARoomById,
} = require("./users");

const Room = require("./models/Room");

const app = require("./app");
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

  socket.on("joinRoom", ({ id, name, newRoom, image }) => {
    socket.userId = id;

    let user = getUser(id);
    if (!user) {
      user = addUser(socket.userId, name, newRoom, image);
    }

    user.room = newRoom;
    socket.join(newRoom);

    io.in(newRoom).emit("notification", {
      title: `${user.name} just entered the room`,
    });

    io.in(newRoom).emit("count", {
      clients: getTotalClientOfARoomById(newRoom),
    });
  });

  socket.on("sendMessage", ({ chat }) => {
    const user = getUser(socket.userId);

    // addMessage(user.name, chat, user.room);

    io.in(user.room).emit("message", {
      name: user.name,
      text: chat,
      image: user.image,
    });
  });

  socket.on("leaveRoom", () => {
    let user = getUser(socket.userId);

    socket.to(user.room).emit("notification", {
      title: `${user.name} just left the room`,
    });

    socket.to(user.room).emit("count", {
      clients: getTotalClientOfARoomById(user.room) - 1,
    });

    socket.leave(user.room);

    user.room = "";
  });

  socket.on("disconnect", () => {
    const user = deleteUser(socket.userId);

    if (user) {
      socket.to(user.room).emit("notification", {
        title: `${user.name} just disconnected from the server`,
      });
      socket.to(user.room).emit("count", {
        clients: getTotalClientOfARoomById(user.room),
      });
    }

    socket.offAny();
  });

  socket.on("count", ({ roomId }) => {
    io.in(roomId).emit("count", { clients: getTotalClientOfARoomById(roomId) });
  });

  // socket.on("init", async ({ roomId, userId }) => {
  // socket.to(roomId).emit("init", { messages: messages(socket.roomId) });
  // });
});
