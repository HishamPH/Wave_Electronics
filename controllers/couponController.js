let Coupon = require("../models/couponModel");

module.exports = {
  getCoupon: async (req, res) => {
    try {
      let coupon = await Coupon.find();
      res.render("admin/coupon", { activePage: "coupons", coupon });
    } catch {
      console.log("catch in getCoupon of coupon.js");
      res.json({ message: "some king of server error" });
    }
  },
  addCoupon: async (req, res) => {
    let { code, count, discount, minPurchase, maxPurchase, start, expire } =
      req.body;
    try {
      let coupon = new Coupon({
        couponCount: count,
        code: code,
        discount: discount,
        minPurchase: minPurchase,
        maxPurchase: maxPurchase,
        start: start,
        expire: expire,
      });

      await coupon.save();

      res.redirect("/admin/coupons");
    } catch (e) {
      console.error(e);
    }
  },
  editCoupon: async (req, res) => {
    let id = req.params.id;
    let { code, count, discount, minPurchase, maxPurchase, start, expire } =
      req.body;
    let coupon = await Coupon.findByIdAndUpdate(id, {
      code: code,
      couponCount: count,
      discount: discount,
      minPurchase: minPurchase,
      maxPurchase: maxPurchase,
      start: start,
      expire: expire,
    });

    res.redirect("/admin/coupons");
  },
  deleteCoupon: async (req, res) => {
    console.log("hello");
    let id = req.params.id;
    let coupon = await Coupon.findByIdAndDelete(id);
    console.log(coupon);
    res.redirect("/admin/coupons");
  },
};
