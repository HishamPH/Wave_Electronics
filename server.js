const express = require("express");
const session = require("express-session");
require("dotenv").config();
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
const PORT = 3000;
const app = express();

const cookieParser = require("cookie-parser");

const adminRouter = require("./routes/adminRouter");
const userRouter = require("./routes/userRouter");
const guestRouter = require("./routes/guestRouter");

const cors = require("cors");

const createServer = async () => {
  try {
    app.use(cookieParser());
    app.use(cors());
    app.options("*", cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.set("view engine", "ejs");
    app.use(nocache());
    app.use(express.static("public"));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(
      session({
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
      })
    );

    app.use((req, res, next) => {
      res.locals.message = req.session.message;
      res.locals.name = req.session.name;
      delete req.session.message;
      next();
    });

    // app.use(express.static('views'))
    app.use("/", guestRouter);
    app.use("/user", userRouter);
    app.use("/admin", adminRouter);

    return app;
  } catch (error) {
    console.log(error);
  }
};

module.exports = createServer;
