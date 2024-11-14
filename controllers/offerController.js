const Offer = require("../models/offerModel");

const Category = require("../models/categoryModel");

module.exports = {
  getOffer: async (req, res) => {
    let cat = await Category.find();
    let offer = await Offer.find().populate("category");
    res.render("admin/offer", { activePage: "offers", cat, offer });
  },
  addOffer: async (req, res) => {
    try {
      let { category, discount, start, expire } = req.body;
      console.log(category);
      let cat = await Category.findOne({ Name: category });
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
      console.error(e);
    }
  },
  editOffer: async (req, res) => {
    let id = req.params.id;
    let { category, discount, start, expire } = req.body;
    let cat = await Category.findOne({ Name: category });
    let offer = await Offer.findByIdAndUpdate(id, {
      category: cat._id,
      discount: discount,
      startDate: start,
      endDate: expire,
    });

    res.redirect("/admin/offers");
  },
};
