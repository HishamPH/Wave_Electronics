const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const Wallet = require("../models/walletModel");

module.exports = {
  getHomePage: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let pd = await Products.find({ status: true })
        .populate("category")
        .limit(8);
      let cat = await Category.find();
      let wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      pd.forEach((item) => {
        const currentVariant = item.variant.find((variant) => variant.default);
        item.defaultVariant = currentVariant;
        const fullPrice =
          parseInt(item.basePrice) + parseInt(currentVariant.price);
        const discount = parseInt((item.basePrice * item.discount) / 100) || 0;
        const offer =
          parseInt((item.basePrice * item.category?.offer) / 100) || 0;
        const totalDiscount = Number(offer + discount);
        item.finalPrice = fullPrice - totalDiscount;
      });
      res.render("user/homepage", {
        message: req.session.name,
        pd,
        cat,
        wishlist,
      });
    } catch (error) {
      next(error);
    }
  },

  getAddress: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let address = user ? user.Address : null;
      let cart = await Cart.findOne({ userId: user._id });
      let q = cart ? cart.total : 0;
      if (address && address.length === 1) {
        user.Address[0].main = true;
        await user.save();
      }
      res.render("user/userprofile", { activePage: "address", address, q });
    } catch (error) {
      next(error);
    }
  },

  setDefault: async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = req.params.id;
    console.log(req.body.main);
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    user.Address[addressIndex].main = true;
    user.Address.forEach((item, index) => {
      if (index !== addressIndex) {
        item.main = false;
      }
    });
    await user.save();
    res.redirect("/user/userprofile/address");
  },

  postAddress: async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = user._id;
    console.log(id);
    await User.findByIdAndUpdate(id, {
      $push: {
        Address: req.body,
      },
    });
    res.redirect("/user/userprofile/address");
  },

  getEditAddress: async (req, res, next) => {
    let id = req.params.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    let ad = user.Address[addressIndex];
    let address = user.Address;
    res.render("user/editaddress", { ad });
    console.log(ad);
  },

  postEditAddress: async (req, res, next) => {
    const addressId = req.params.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const { name, street, city, pincode, state, mobile } = req.body;
    const addressIndex = user.Address.findIndex(
      (a) => a._id.toString() === addressId
    );
    if (addressIndex !== -1) {
      user.Address[addressIndex].name = name;
      user.Address[addressIndex].street = street;
      user.Address[addressIndex].city = city;
      user.Address[addressIndex].state = state;
      user.Address[addressIndex].pincode = pincode;
      user.Address[addressIndex].mobile = mobile;
      await user.save();
      console.log("Address updated successfully");
      res.redirect("/user/userprofile/address");
    } else {
      console.log("Address Not Found");
      res.redirect("/user/userprofile/address");
    }
  },

  deleteAddress: async (req, res, next) => {
    const addressId = req.params.id;
    console.log("address id is to delete", addressId);
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return res.redirect("/user/userprofile/address");
      }
      const addressIndex = user.Address.findIndex(
        (a) => a._id.toString() === addressId
      );
      if (addressIndex === -1) {
        console.log("Address not found");
        return res.redirect("/user/userprofile/address");
      }
      user.Address.splice(addressIndex, 1);
      if (user.Address.length === 1) user.Address[0].main = true;
      await user.save();
      console.log("Address deleted successfully");
      return res.redirect("/user/userprofile/address");
    } catch (error) {
      console.error("Error deleting address:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  },

  getProfile: async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const q = req.session.cartCount;
    res.render("user/userdetail", { activePage: "profile", user, q });
  },

  editProfile: async (req, res, next) => {
    let id = req.params.id;
    console.log(req.body);
    const { name, phone } = req.body;
    let user = await User.findByIdAndUpdate(
      id,
      {
        name,
        phone,
      },
      { new: true }
    );
    req.session.name = user.name;
    res.redirect("/user/userprofile");
  },

  changePassword: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { pass, pass1, pass2 } = req.body;
      const user = await User.findById(id);
      const isValid = await bcrypt.compare(pass, user.password);
      if (isValid) {
        if (pass1 === pass2) {
          const hash = await bcrypt.hash(pass1, 10);
          user.password = hash;
          await user.save();
          res.redirect("/user/userprofile");
        } else {
          res.json({ message: "your passwords do not match" });
        }
      } else {
        res.json({ message: "your typed the wrong password" });
      }
    } catch (e) {
      console.error(e);
      console.log("this is a password issue");
      res.json({ message: "password do not match" });
    }
  },

  getWallet: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let wallet = await Wallet.findOne({ userId: user._id });
      //wallet.balance = 10000;
      if (wallet && wallet.transactions && wallet.transactions.length > 0) {
        wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in descending order
      }
      res.render("user/wallet", { activePage: "wallet", wallet });
    } catch (error) {
      next(error);
    }
  },

  logoutUser: async (req, res) => {
    try {
      console.log("user logout", new Date());
      req.session.destroy();
      res.locals = null;
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
};
