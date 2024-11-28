const Products = require("../models/productModel");
const Category = require("../models/categoryModel");

module.exports = {
  getSearch: async (req, res, next) => {
    try {
      let product = await Products.find({ status: true })
        .populate("category")
        .sort({ defaultPrice: 1 })
        .limit(4)
        .lean();
      let cat = await Category.find({ status: true });
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

      res.render("user/guestSearch", {
        product,
        cat,
        currentPage,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  getGuestDetailPage: async (req, res) => {
    let id = req.params.id;
    let pd = await Products.findById(id).populate("category").select("-__v");
    const defaultVariant = pd.variant.find((variant) => variant.default);
    const colorSet = new Set();
    const storageSet = new Set();
    pd.variant.forEach((item) => {
      colorSet.add(item.color);
      if (item.storage.trim() !== "") {
        storageSet.add(item.storage);
      }
    });
    const color = [...colorSet];
    const storage = [...storageSet];
    const fullPrice = Number(pd.basePrice) + Number(defaultVariant.price || 0);
    const offer = parseInt((pd.basePrice * pd.category?.offer) / 100) || 0;
    const discount = parseInt((pd.basePrice * pd.discount) / 100);
    const totalDiscount = Number(offer + discount);
    res.render("user/productdetail", {
      pd,
      defaultVariant,
      storage,
      color,
      fullPrice,
      totalDiscount,
    });
  },
  filterProducts: async (req, res, next) => {
    try {
      const userId = req.session?.user?._id;
      const { sort, query, page } = req.query;
      const { filters } = req.body;

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

      res.json({ products, currentPage: page, totalPages });
    } catch (err) {
      next(err);
    }
  },
};
