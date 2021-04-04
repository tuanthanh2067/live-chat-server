const { createServer } = require("http");
const { Server } = require("socket.io");
const { addClient } = require("./socket-client");

const app = require("./app");
const httpServer = createServer(app);

const wsServerOptions = {
  cors: {
    origin: "*",
    methods: ["GET"],
  },
};

const wsServer = new Server(httpServer, wsServerOptions);

wsServer.on("connection", (socket) => {
  addClient(socket);
});

// listen on port 5000
httpServer.listen(5000);
