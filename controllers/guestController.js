const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

module.exports = {
  getSearch: async (req, res) => {
    try {
      let product = await productModel.find({ Display: true }).limit(8);
      let cat = await categoryModel.find();
      currentPage = 1;
      console.log(product.length);
      let noOfDocs = await productModel
        .find({ Display: true })
        .countDocuments();

      let totalPages = Math.ceil(noOfDocs / 8);
      let q = req.session.cartCount || 0;
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
};
