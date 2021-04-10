const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const dotenv = require("dotenv");

const User = require("./models/User");
const userRoutes = require("./routes/user");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use("/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("Api server's working");
});

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function verify(payload, done) {
      if (!payload) {
        return done(null, false);
      }
      let user;
      try {
        user = await User.findById(payload.id).exec();
      } catch (err) {
        console.log(err);
        return done(null, false);
      }

      if (!user) {
        return done(null, false);
      }
      done(null, user);
    }
  )
);

module.exports = app;
