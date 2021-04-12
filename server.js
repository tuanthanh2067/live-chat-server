const { createServer } = require("http");
// const { Server } = require("socket.io");
const mongoose = require("mongoose");

// const { addClient } = require("./socket-client");

const app = require("./app");
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// const wsServerOptions = {
//   cors: {
//     origin: "*",
//     methods: ["GET"],
//   },
// };

// const wsServer = new Server(httpServer, wsServerOptions);

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

// wsServer.on("connection", (socket) => {
//   addClient(socket);
// });
