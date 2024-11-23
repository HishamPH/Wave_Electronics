const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");

module.exports = {
  getLandPage: async (req, res) => {
    if (req.cookies.accessToken) {
      res.redirect("/user/homepage");
      return;
    }
    let pd = await Products.find({ status: true }).populate("offer").limit(8);
    pd.forEach((item) => {
      item.defaultVariant = item.variant.find((variant) => variant.default);
    });
    res.render("user/landpage", { pd });
  },

  getHomePage: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let pd = await Products.find({ status: true }).populate("offer").limit(8);
      let cat = await Category.find();
      let wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      pd.forEach((item) => {
        item.defaultVariant = item.variant.find((variant) => variant.default);
      });
      res.render("user/homepage", {
        message: req.session.name,
        pd,
        cat,
        wishlist,
      });
    } catch (e) {
      console.error(e);
    }
  },

  categorySort: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = req.params.id;
    let pd = await Products.find({ Category: id });
    let cat = await Category.find();
    let wish = user.Wishlist;
    let wishlist = [];
    wish.forEach((item) => {
      wishlist.push(item.product.toString());
    });
    let q = req.session.cartCount || 0;
    let message = req.session.name;

    res.render("user/homepage", { message, pd, cat, q, wishlist });
  },

  getDetailPage: async (req, res) => {
    let id = req.params.id;
    let pd = await Products.findById(id)
      .populate("offer category")
      .select("-__v");
    const defaultVariant = pd.variant.find((variant) => variant.default);
    const colorSet = new Set();
    const storageSet = new Set();
    pd.variant.forEach((item) => {
      colorSet.add(item.color);
      storageSet.add(item.storage);
    });
    const color = [...colorSet];
    const storage = [...storageSet];
    res.render("user/productdetail", { pd, defaultVariant, storage, color });
  },

  review: async (req, res) => {
    let id = req.params.id;
    let review = req.body.review;
    await Products.updateOne(
      { _id: id },
      {
        $push: { reviews: review },
      }
    );
    res.redirect(`/user/detail/${id}`);
  },

  getAddress: async (req, res) => {
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
    } catch (e) {
      console.error(e);
      console.log("this is catch");
      let q = 0;
      res.render("user/userprofile", {
        activePage: "address",
        q,
        address: false,
      });
    }
  },

  setDefault: async (req, res) => {
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

  postAddress: async (req, res) => {
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

  getEditAddress: async (req, res) => {
    let id = req.params.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    let ad = user.Address[addressIndex];
    let address = user.Address;
    res.render("user/editaddress", { ad });
    console.log(ad);
  },

  postEditAddress: async (req, res) => {
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

  deleteAddress: async (req, res) => {
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

  getProfile: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const q = req.session.cartCount;
    res.render("user/userdetail", { activePage: "profile", user, q });
  },

  editProfile: async (req, res) => {
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

  changePassword: async (req, res) => {
    try {
      let id = req.params.id;
      let { pass, pass1, pass2 } = req.body;
      let user = await User.findById(id);
      //let hash = await bcrypt.hash(pass,10);
      let isValid = await bcrypt.compare(pass, user.password);
      if (isValid) {
        if (pass1 === pass2) {
          let hash = await bcrypt.hash(pass1, 10);
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

  getSearch: async (req, res, next) => {
    try {
      console.log("helloe");
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let product = await Products.find({ status: true })
        .populate("offer")
        .sort({ defaultPrice: 1 })
        .limit(1);
      let cat = await Category.find();
      let wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      currentPage = 1;
      console.log(product.length);
      let noOfDocs = await Products.find({ status: true }).countDocuments();
      product.forEach((item) => {
        item.defaultVariant = item.variant.find((variant) => variant.default);
      });
      let totalPages = Math.ceil(noOfDocs / 1);
      res.render("user/searchresult", {
        product,
        cat,
        wishlist,
        currentPage,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  searchProduct: async (req, res) => {
    let { q } = req.query;
    console.log(q);
    let products = await Products.find({
      ProductName: { $regex: new RegExp(q, "i") },
    });
    res.json({ products, q });
  },
  filterProducts: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const { sort, query, page } = req.query;
      const { filters } = req.body;
      console.log(req.query, req.body);
      const user = await User.findById(userId);
      const wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      const limit = 1;
      let products = null;
      let totalDocs = 0;
      if (sort == "lth" || sort == "htl") {
        totalDocs = await Products.countDocuments({
          category: { $in: filters },
          productName: { $regex: new RegExp(query, "i") },
        });
        let currentSort;
        if (sort == "lth") currentSort = 1;
        else currentSort = -1;
        products = await Products.find({
          category: { $in: filters },
          productName: { $regex: new RegExp(query, "i") },
        })
          .sort({ defaultPrice: currentSort })
          .collation({ locale: "en", strength: 2 })
          .populate("offer")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (sort == "az" || sort == "za") {
        totalDocs = await Products.countDocuments({
          category: { $in: filters },
          productName: { $regex: new RegExp(query, "i") },
        });
        let currentSort;
        if (sort == "az") currentSort = 1;
        else currentSort = -1;
        products = await Products.find({
          category: { $in: filters },
          productName: { $regex: new RegExp(query, "i") },
        })
          .sort({ productName: currentSort })
          .collation({ locale: "en", strength: 2 })
          .populate("offer")
          .skip((page - 1) * limit)
          .limit(limit);
      }
      const totalPages = Math.ceil(totalDocs / limit);
      res.json({ products, wishlist, currentPage: page, totalPages });
    } catch (err) {
      next(err);
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
