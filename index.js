const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
  url: REDIS_URL,
  legacyMode: true,
});

redisClient.on("connect", () => console.log("Connected to Redis!"));
redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

// TODO: Ensure the database connection is up & running.
// The name of the database that has the collection with the user credentials.
mongoose
  .connect(mongoURL)
  .then(() => console.log("Successfully connected to DB"))
  .catch((e) => console.log(e));

// Parses incoming request with JSON payloads and is based on body-parser
app.use(express.json());

// Indicates the app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client.
app.enable("trust proxy");
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      logErrors: true,
    }),
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    // TODO: How to configure the cookies here...
    cookie: {
      sameSite: true,
      secure: false, // Work with HTTPS
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("oh no. No session!"));
  }
  next();
});

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi there!</h2>");
  console.log("Yeah, it ran");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
