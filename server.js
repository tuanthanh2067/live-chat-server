const { createServer } = require("http");

const app = require("./app");
const httpServer = createServer(app);

// listen on port 5000
httpServer.listen(5000);
