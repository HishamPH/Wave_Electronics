const User = require("../models/userModel");

module.exports = {
  wishlist: async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.session.user._id;
      const user = await User.findById(userId).populate("Wishlist.product");
      const index = user.Wishlist.findIndex(
        (a) => a.product._id.toString() === id
      );
      let status = true;
      if (index == -1) {
        user.Wishlist.push({ product: id });
      } else {
        user.Wishlist.splice(index, 1);
        status = false;
      }
      await user.save();
      const wishlist = user.Wishlist.length;
      req.session.wishList = wishlist;
      res.locals.wishList = req.session.wishList;
      res.json({ status, wishlist });
    } catch (e) {
      console.error(e);
    }
  },
  getWishlist: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId).populate("Wishlist.product");
      let wish = user.Wishlist.reverse() ?? false;
      res.render("user/wishlist", { wish });
    } catch (e) {
      console.error(e);
      console.log("catch in wishlist 40");
    }
  },
  deleteWishlist: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let id = req.params.id;
      let index = user.Wishlist.findIndex((a) => a._id.toString() === id);
      user.Wishlist.splice(index, 1);
      await user.save();
      req.session.wishList = user.Wishlist.length;
      res.locals.wishList = req.session.wishList;
      res.redirect("/user/wishlist");
    } catch (e) {
      console.error(e);
      res.redirect("/user/wihslist");
      console.log("this is the catch inside wishlist 55");
    }
  },
};
