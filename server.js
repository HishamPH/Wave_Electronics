const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { config } = require("dotenv");
const { EventEmitter } = require("events");
const adminRouter = require("./routes/adminRouter");
const userRouter = require("./routes/userRouter");
const guestRouter = require("./routes/guestRouter");
config();

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
      res.locals.isUser = req.session.isUser || false;
      res.locals.message = req.session.message || null;
      res.locals.name = req.session.user?.name || null;
      res.locals.cartCount = req.session.cartCount || 0;
      res.locals.wishList = req.session.wishList || 0;
      res.locals.adminname = req.session.admin?.name || null;
      delete req.session.message;
      next();
    });

    EventEmitter.defaultMaxListeners = 20;

    // app.use(express.static('views'))
    app.use("/", guestRouter);
    app.use("/user", userRouter);
    app.use("/admin", adminRouter);

    app.use((err, req, res, next) => {
      console.error(err?.message);
      res.status(500).json({ status: false, message: err.message });
    });

    return app;
  } catch (error) {
    console.log("main server error occured");
    console.log(error);
  }
};

module.exports = createServer;
