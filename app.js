const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const dotenv = require("dotenv");

const User = require("./models/User");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const notificationRoutes = require("./routes/notifications");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

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
        user = await User.findOne({ userId: payload.userId }).exec();
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

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Api server's working");
});

module.exports = app;
