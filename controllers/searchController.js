const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");

module.exports = {
  getSearch: async (req, res, next) => {
    try {
      const userId = req.session?.user?._id;
      let product = await Products.find({ status: true })
        .populate("category")
        .sort({ defaultPrice: 1 })
        .limit(4)
        .lean();
      let cat = await Category.find({ status: true });
      let wishlist = [];
      if (userId) {
        const user = await User.findById(userId);
        const wish = user.Wishlist;
        wish.forEach((item) => {
          wishlist.push(item.product.toString());
        });
      }
      currentPage = 1;
      console.log(product.length);
      let noOfDocs = await Products.find({ status: true }).countDocuments();
      product.forEach((item) => {
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
      let totalPages = Math.ceil(noOfDocs / 4);
      const isUser = req?.session?.isUser;
      res.render("user/searchresult", {
        product,
        cat,
        wishlist,
        currentPage,
        totalPages,
        isUser,
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
      const userId = req.session?.user?._id;
      const { sort, query, page } = req.query;
      const { filters } = req.body;
      let wishlist = [];
      if (userId) {
        const user = await User.findById(userId);
        const wish = user.Wishlist;
        wish.forEach((item) => {
          wishlist.push(item.product.toString());
        });
      }

      const limit = 4;
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
          .populate("category")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
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
          .populate("category")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
      }
      for (const item of products) {
        const currentVariant = item.variant.find((variant) => variant.default);
        item.defaultVariant = currentVariant;
        const fullPrice =
          parseInt(item.basePrice) + parseInt(currentVariant.price);
        const discount = parseInt((item.basePrice * item.discount) / 100) || 0;
        const offer =
          parseInt((item.basePrice * item.category?.offer) / 100) || 0;
        const totalDiscount = Number(offer + discount);
        item.finalPrice = fullPrice - totalDiscount;
      }
      const totalPages = Math.ceil(totalDocs / limit);
      const isUser = req?.session?.isUser;
      res.json({ products, wishlist, currentPage: page, totalPages, isUser });
    } catch (err) {
      next(err);
    }
  },
};
