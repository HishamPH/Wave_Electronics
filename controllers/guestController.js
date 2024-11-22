const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

module.exports = {
  getSearch: async (req, res) => {
    try {
      let product = await Product.find({ Display: true }).limit(8);
      let cat = await Category.find();
      currentPage = 1;
      console.log(product.length);
      let noOfDocs = await Product.find({ Display: true }).countDocuments();

      let totalPages = Math.ceil(noOfDocs / 8);
      let q = req.session.cartCount || 0;
      console.log(totalPages);
      res.render("user/searchresult", {
        message: req?.session?.name,
        product,
        q,
        cat,
        currentPage,
        totalPages,
      });
    } catch (error) {
      console.log(error);
    }
  },
  getGuestDetailPage: async (req, res, next) => {
    try {
      let id = req.params.id;
      let pd = await Product.findById(id).select("-__v");
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
    } catch (error) {
      next(error);
    }
  },
};
