const Products = require("../models/productModel");
const User = require("../models/userModel");

module.exports = {
  updateWishlist: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { variant } = req.body;
      const userId = req.session.user._id;
      const user = await User.findById(userId).populate("Wishlist.product");
      const pd = await Products.findById(id);
      let currentVariant;
      if (variant) {
        currentVariant = pd.variant.find(
          (item) =>
            item.color == variant.color && item.storage == variant.storage
        );
      } else {
        currentVariant = pd.variant.find((item) => item.default);
      }
      const index = user.Wishlist.findIndex(
        (item) =>
          item.product._id.toString() === id &&
          item.color === currentVariant.color &&
          item.storage === currentVariant.storage
      );
      let isAdded = true;
      if (index == -1) {
        user.Wishlist.push({
          product: id,
          color: currentVariant.color,
          storage: currentVariant.storage,
          image: currentVariant.images[0],
        });
      } else {
        user.Wishlist.splice(index, 1);
        isAdded = false;
      }
      await user.save();
      const wishlist = user.Wishlist.length;
      req.session.wishList = wishlist;
      res.locals.wishList = req.session.wishList;
      res.status(200).json({ status: true, isAdded, wishlist });
    } catch (error) {
      next(error);
    }
  },
  getWishlist: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId).populate("Wishlist.product");
      let wish = user.Wishlist.reverse() ?? false;
      res.render("user/wishlist", { activePage: "wishlist", wish });
    } catch (error) {
      next(error);
    }
  },
  deleteWishlist: async (req, res, next) => {
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
    } catch (error) {
      next(error);
    }
  },
};
