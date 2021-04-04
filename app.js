const express = require("express");
const cors = require("cors");

const app = express();

// allow cross-origin requests (from react front-end to back-end server)
app.use(cors());

app.get("/", (req, res) => {
  res.json("ok");
});

module.exports = app;
