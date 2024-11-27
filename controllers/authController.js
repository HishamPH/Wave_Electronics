const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const OTP = require("../models/otpModel");
const { generateOTP, sendOTP } = require("../utility/otpfunctions");
const Cart = require("../models/cartModel");
const Wallet = require("../models/walletModel");
const { loginAccessToken, loginRefreshToken } = require("../utility/jwtToken");

module.exports = {
  getLogin: (req, res) => {
    res.render("user/user_login");
  },

  postLogin: async (req, res) => {
    try {
      let { username, password } = req.body;
      let user = await User.findOne({ email: username });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "user not found" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res
          .status(403)
          .json({ status: false, message: "Incorrect password" });
      }
      if (!user.status) {
        return res
          .status(401)
          .json({ status: false, message: "user is blocked, contact admin" });
      }
      req.session.name = user.name;
      let cart = await Cart.findOne({ userId: user._id });
      if (cart) req.session.cartCount = cart.total;
      const { _id, email } = user;
      const result = { _id, email };
      const accessToken = await loginAccessToken(result);
      const refreshToken = await loginRefreshToken(result);
      if (accessToken && refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
      req.session.isUser = true;
      res.locals.isUser = true;
      return res.status(200).json({ status: true, message: "Login succesful" });
    } catch (e) {
      //res.redirect('/user/login')
      console.error(e);
    }
  },

  getaddUser: (req, res) => {
    res.render("user/user_signup");
  },

  postAddUser: async (req, res, next) => {
    try {
      console.log("hello");
      email = req.body.email;
      const data = await User.findOne({ email });
      if (data) {
        return res
          .status(401)
          .json({ status: false, message: "email already exists" });
      }
      req.session.result = req.body;
      let otpval = generateOTP();
      const duration = 60 * 1000;
      const createdAt = Date.now();
      const expiresAt = createdAt + duration;
      const newOTP = new OTP({
        email: email,
        otp: otpval,
        expiresAt: expiresAt,
      });
      await newOTP.save();
      await sendOTP(email, otpval);
      console.log(req.body);
      return res
        .status(200)
        .json({ status: true, message: "An OTP is send to the email" });
    } catch (error) {
      next(error);
    }
  },

  getEmailVerification: async (req, res) => {
    try {
      res.render("user/emailverification");
    } catch (error) {
      next(error);
    }
  },

  postEmailVerification: async (req, res, next) => {
    try {
      const { otp } = req.body;
      const { name, email, phone, password } = req.session.result;
      const otpExist = await OTP.findOne({
        email: email,
      });
      if (!otpExist) {
        return res
          .status(404)
          .json({ status: false, message: "otp missing resend it" });
      }
      const { expiresAt } = otpExist;

      if (expiresAt < Date.now()) {
        await OTP.deleteOne({ email: email });
        return res
          .status(401)
          .json({ status: false, message: "otp expired try resending it" });
      }
      if (Number(otp) !== otpExist.otp) {
        return res
          .status(402)
          .json({ status: false, message: "otp does not match,try again" });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        phone,
        password: hash,
      });
      await user.save();
      req.session.name = user.name;
      await Wallet.create({ userId: user._id });
      const { _id } = user;
      const result = { _id, email };
      const accessToken = await loginAccessToken(result);
      const refreshToken = await loginRefreshToken(result);
      if (accessToken && refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
      req.session.isUser = true;
      res.locals.isUser = true;
      return res
        .status(200)
        .json({ status: true, message: "registration successful" });
    } catch (error) {
      next(error);
    }
  },

  resendOTP: async (req, res, next) => {
    try {
      let email = req.session.result.email;
      let otpExist = await OTP.findOne({ email: email });
      if (!otpExist) {
        let otpval = generateOTP();
        sendOTP(email, otpval);
      }
      res.redirect("/user/emailverification");
    } catch (error) {
      next(error);
    }
  },
};
