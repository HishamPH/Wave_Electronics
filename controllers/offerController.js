const Offer = require("../models/offerModel");

const Category = require("../models/categoryModel");

module.exports = {
  getOffer: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("admin/offer", { activePage: "offers", categories });
    } catch (error) {
      next(error);
    }
  },
  addOffer: async (req, res) => {
    try {
      let { category, discount, start, expire } = req.body;
      console.log(category);
      let cat = await Category.findOne({ categoryName: category });
      console.log(cat);
      let offer = new Offer({
        category: cat._id,
        percentage: discount,
        startDate: start,
        endDate: expire,
      });

      await offer.save();

      res.redirect("/admin/offers");
    } catch (e) {
      next(error);
    }
  },
  editOffer: async (req, res) => {
    try {
      let id = req.params.id;
      let { category, discount, start, expire } = req.body;
      let cat = await Category.findOne({ categoryName: category });
      let offer = await Offer.findByIdAndUpdate(id, {
        category: cat._id,
        discount: discount,
        startDate: start,
        endDate: expire,
      });

      res.redirect("/admin/offers");
    } catch (error) {
      next(error);
    }
  },
};
