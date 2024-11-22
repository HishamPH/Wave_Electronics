const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const OTP = require("../models/otpModel");
const otpFunc = require("../utility/otpfunctions");
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
      let b;
      let isValid = false;
      if (user) {
        b = user.status ?? false;
        isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          req.session.message = {
            type: "success",
            message: "incorrect Password",
          };
          res.redirect("/user/login");
        }
      }
      if (!user) {
        req.session.message = {
          type: "success",
          message: "incorrect Username or Password",
        };
        res.redirect("/user/login");
      } else if (user.email == username && isValid) {
        req.session.result = req.body;
        req.session.name = user.name;
        let cart = await Cart.findOne({ userId: user._id });
        if (cart) req.session.cartCount = cart.total;
        const { _id, name, email, phone, status, Address, Wishlist } = user;
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
        res.redirect("/user/homepage");
      } else if (!b) {
        req.session.message = {
          type: "success",
          message: "This user isn't available right now",
        };
        console.log("heloo");
        res.redirect("/user/login");
      }
    } catch (e) {
      //res.redirect('/user/login')
      console.error(e);
    }
  },

  getaddUser: (req, res) => {
    res.render("user/user_signup");
  },

  postAddUser: async (req, res) => {
    email = req.body.email;
    const data = await User.findOne({ email });
    if (data != null) {
      req.session.message = {
        type: "success",
        message: "email is already existing",
      };
      res.redirect("/user/signup");
    }
    if (data == null) {
      req.session.result = req.body;
      let otpval = otpFunc.generateOTP();
      otpFunc.sendOTP(req, res, email, otpval);
      console.log(req.body);
      res.redirect("/user/emailverification");
    }
  },

  getEmailVerification: async (req, res) => {
    const Email = req.session.result.email;
    setTimeout(() => {
      OTP.deleteOne({ Email: Email })
        .then(() => {
          console.log("Document deleted successfully");
        })
        .catch((err) => {
          console.error(err);
        });
    }, 60000);
    res.render("user/emailverification");
  },

  postEmailVerification: async (req, res) => {
    console.log(req.body);
    let otp = req.body.otp;
    console.log(otp.join(""));
    const Email = req.session.result.email;
    const matchedOTPrecord = await OTP.findOne({
      Email: Email,
    });
    const { expiresAt } = matchedOTPrecord;
    if (expiresAt) {
      if (expiresAt < Date.now()) {
        await OTP.deleteOne({ Email: Email });
        throw new Error("The OTP code has expired. Please request a new one.");
      }
    } else {
      console.log("ExpiresAt is not defined in the OTP record.");
    }
    if (Number(otp.join("")) == matchedOTPrecord.otp) {
      req.session.OtpValid = true;
      let { name, email, phone, password } = req.session.result;
      let hash = await bcrypt.hash(password, 10);
      let user = new User({
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
      res.redirect("/user/homepage");
    } else {
      console.log("Entered OTP does not match stored OTP.");
      res.redirect("/user/emailverification");
    }
  },

  resendOTP: async (req, res) => {
    let email = req.session.result.email;
    let a = await OTP.countDocuments();
    if (!a) {
      let otpval = otpFunc.generateOTP();
      otpFunc.sendOTP(req, res, email, otpval);
    }
    res.redirect("/user/emailverification");
  },
};
