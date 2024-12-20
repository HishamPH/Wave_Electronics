const jwt = require("jsonwebtoken");
const { loginAccessToken } = require("../utility/jwtToken");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");

const userAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const { _id, email } = decoded;
    const user = await User.findById(_id).select("-password -__v");
    if (!user.status) {
      return res.redirect("/user/logout");
    }
    if (!req.session.user) {
      console.log("there is no session so no party");

      const cart = await Cart.findOne({ userId: _id }).select("total");
      const { name, Wishlist } = user;

      req.session.user = { _id, email, name };
      req.session.cartCount = cart?.total || 0;
      req.session.wishList = Wishlist.length || 0;
      req.session.isUser = true;
      res.locals.name = name || "";
      res.locals.cartCount = cart?.total || 0;
      res.locals.wishList = Wishlist.length || 0;
      res.locals.isUser = true;
    }
    next();
  } catch (error) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        console.log(error);
        res.redirect("/user/logout");
        return;
      }
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const { _id, email } = decoded;
      const user = await User.findById(_id).select("-password -__v");
      if (!user.status) {
        return res.redirect("/user/logout");
      }
      if (!req.session.user) {
        console.log(
          "there is no session so no in refresh side of the part party"
        );
        const cart = await Cart.findOne({ userId: _id }).select("total");
        const { name, Wishlist } = user;
        req.session.user = { _id, email, name };
        req.session.cartCount = cart?.total || 0;
        req.session.wishList = Wishlist.length || 0;
        req.session.isUser = true;
        res.locals.name = name || "";
        res.locals.cartCount = cart?.total || 0;
        res.locals.wishList = Wishlist.length || 0;
        res.locals.isUser = true;
      }
      const newAccessToken = await loginAccessToken({ _id, email });
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      next();
    } catch (error) {
      console.log(error);
      res.redirect("/user/logout");
    }
  }
};

module.exports = userAuth;
