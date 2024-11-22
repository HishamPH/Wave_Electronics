const User = require("../models/userModel");

const Products = require("../models/productModel");
// const Coupon = require('../models/coupon')
const Cart = require("../models/cartModel");

const Coupon = require("../models/couponModel");
const Offer = require("../models/offerModel");

module.exports = {
  addToCart: async (req, res) => {
    try {
      console.log("adding to the cart ");
      const id = req.params.id;
      const { variant } = req.body;
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      const pd = await Products.findById(id).populate("offer");
      let currentVariant;
      if (variant) {
        currentVariant = pd.variant.find(
          (item) =>
            item.color == variant.color && item.storage == variant.storage
        );
      } else {
        currentVariant = pd.variant.find((variant) => variant.default);
      }
      if (currentVariant.stock <= 0) {
        return res.status(404).json({
          status: false,
          message: "no stock for this combination available",
        });
      }
      let cart = await Cart.findOne({ userId: user._id });
      //let price = pd.defaultPrice;
      const fullPrice =
        Number(pd.basePrice) + Number(currentVariant.price || 0);
      console.log(fullPrice);
      const offer = parseInt((pd.basePrice * pd?.offer?.percentage) / 100) || 0;

      const discount = parseInt((pd.basePrice * pd.discount) / 100);
      const totalDiscount = Number(offer + discount);
      const totalPrice = fullPrice - totalDiscount;
      if (cart) {
        const exist = cart.items.find(
          (item) =>
            item.productId.toString() === id &&
            item.color === currentVariant.color &&
            item.storage === currentVariant.storage
        );
        if (!exist) {
          cart.items.push({
            productId: id,
            quantity: 1,
            price: totalPrice,
            color: currentVariant.color,
            storage: currentVariant.storage,
            image: currentVariant.images[0],
          });
          cart.total++;
        } else {
          if (exist?.quantity >= 2) {
            return res.status(403).json({ message: "product limit reached" });
          }
          exist.quantity++;
        }
      } else {
        cart = await Cart.create({
          userId: user._id,
          items: [
            {
              productId: id,
              quantity: 1,
              price: totalPrice,
              color: currentVariant.color,
              storage: currentVariant.storage,
              image: currentVariant.images[0],
            },
          ],
          total: 1,
        });
      }
      await cart.save();
      req.session.cartCount = cart.total;
      res.locals.cartCount = cart.total;
      res.status(200).json({ count: cart.total, messag: "added to the cart" });
    } catch (e) {
      console.error(e);
    }
  },

  getCart: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let cart = await Cart.findOne({ userId: user._id }).populate(
      "items.productId coupon"
    );
    let coupons = await Coupon.find();

    if (cart?.items.length) {
      let items = cart.items;
      cart.total = cart.items.length;
      console.log(cart.total);
      cart.coupon = null;
      await cart.save();
      let totalPrice = 0;
      let totalDiscount = 0;
      for (const item of cart.items) {
        let currentVariant = item.productId.variant.find(
          (variant) =>
            variant.color == item.color && variant.storage == item.storage
        );
        const fullPrice =
          Number(item.productId.basePrice) + Number(currentVariant.price || 0);

        const currOffer = await Offer.findById(item.productId.offer);
        // console.log(currOffer);

        const offer =
          parseInt((item.productId.basePrice * currOffer?.percentage) / 100) ||
          0;
        const discount = parseInt(
          (item.productId.basePrice * item.productId.discount) / 100
        );
        const fullDiscount = Number(offer + discount);

        totalPrice += fullPrice * item.quantity;
        totalDiscount += fullDiscount * item.quantity;
      }
      req.session.totalPrice = totalPrice - totalDiscount;
      res.render("user/cart", {
        items,
        msg: false,
        totalPrice,
        total: cart.total,
        totalDiscount,
        coupons,
      });
    } else {
      res.render("user/cart", { msg: "your cart is empty" });
    }
  },
  deleteFromCart: async (req, res) => {
    try {
      console.log("deleting from cart");
      let id = req.params.id;
      let cart = await Cart.findOne({
        items: { $elemMatch: { _id: id } },
      }).populate("items.productId");
      let pdIndex = cart.items.findIndex((a) => a._id.toString() === id);
      cart.items.splice(pdIndex, 1);
      cart.total--;
      cart.coupon = null;
      await cart.save();

      let totalPrice = 0;
      let totalDiscount = 0;
      for (const item of cart.items) {
        let currentVariant = item.productId.variant.find(
          (variant) =>
            variant.color == item.color && variant.storage == item.storage
        );
        const fullPrice =
          Number(item.productId.basePrice) + Number(currentVariant.price || 0);

        const currOffer = await Offer.findById(item.productId.offer);
        // console.log(currOffer);

        const offer =
          parseInt((item.productId.basePrice * currOffer?.percentage) / 100) ||
          0;
        const discount = parseInt(
          (item.productId.basePrice * item.productId.discount) / 100
        );
        const fullDiscount = Number(offer + discount);

        totalPrice += fullPrice * item.quantity;
        totalDiscount += fullDiscount * item.quantity;
      }
      req.session.totalPrice = totalPrice - totalDiscount;
      req.session.cartCount = cart.total;
      res.locals.cartCount = cart.total;
      return res.status(200).json({
        status: true,
        message: "item deletion successful",
        totalPrice,
        totalDiscount,
        count: cart.total,
      });
    } catch (err) {
      console.log(err);
    }
  },
  changeQuantity: async (req, res) => {
    try {
      let id = req.params.id;
      const { action, value } = req.body;
      let cart = await Cart.findOne({
        items: { $elemMatch: { _id: id } },
      }).populate("items.productId");

      let pdIndex = cart.items.findIndex((a) => a._id.toString() === id);
      cart.coupon = null;

      const product = await Products.findById(cart.items[pdIndex].productId);
      if (action === "increment" && cart.items[pdIndex].quantity < 2) {
        if (product.stock <= 0) {
          return res
            .status(404)
            .json({ status: false, message: "no stock available" });
        }
        cart.items[pdIndex].quantity++;
      } else if (action === "decrement" && value > 1) {
        cart.items[pdIndex].quantity--;
      }
      await cart.save();
      let price;
      let totalPrice = 0;
      let totalDiscount = 0;
      for (const item of cart.items) {
        let currentVariant = item.productId.variant.find(
          (variant) =>
            variant.color == item.color && variant.storage == item.storage
        );
        const fullPrice =
          Number(item.productId.basePrice) + Number(currentVariant.price || 0);

        const currOffer = await Offer.findById(item.productId.offer);
        // console.log(currOffer);

        const offer =
          parseInt((item.productId.basePrice * currOffer?.percentage) / 100) ||
          0;
        const discount = parseInt(
          (item.productId.basePrice * item.productId.discount) / 100
        );
        const fullDiscount = Number(offer + discount);

        totalPrice += fullPrice * item.quantity;
        totalDiscount += fullDiscount * item.quantity;
        if (cart.items[pdIndex] == item) {
          price = fullPrice - fullDiscount;
        }
      }
      req.session.totalPrice = totalPrice - totalDiscount;
      return res.status(200).json({
        quantity: cart.items[pdIndex].quantity,
        count: cart.total,
        price,
        totalPrice,
        totalDiscount,
      });
    } catch (e) {
      console.error(e);
      console.log("this is the catch block in changeQuantity in cart.js");
    }
  },
  getCheckout: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let cart = await Cart.findOne({ userId: user._id }).populate(
        "items.productId"
      );
      const coupons = await Coupon.find({
        start: { $lt: Date.now() },
        end: { $gt: Date.now() },
        count: { $gt: 0 },
        status: true,
      });
      let adIndex = user.Address.findIndex((item) => item.main === true);
      let address = user.Address[adIndex];
      if (!address) {
        res.redirect("/user/userprofile/address");
        return;
      }
      let items = cart.items;
      cart.total = cart.items.length;
      cart.coupon = null;
      await cart.save();
      let totalPrice = 0;
      let totalDiscount = 0;
      for (const item of cart.items) {
        let currentVariant = item.productId.variant.find(
          (variant) =>
            variant.color == item.color && variant.storage == item.storage
        );
        const fullPrice =
          Number(item.productId.basePrice) + Number(currentVariant.price || 0);

        const currOffer = await Offer.findById(item.productId.offer);
        // console.log(currOffer);

        const offer =
          parseInt((item.productId.basePrice * currOffer?.percentage) / 100) ||
          0;
        const discount = parseInt(
          (item.productId.basePrice * item.productId.discount) / 100
        );
        const fullDiscount = Number(offer + discount);

        totalPrice += fullPrice * item.quantity;
        totalDiscount += fullDiscount * item.quantity;
      }
      req.session.totalPrice = totalPrice - totalDiscount;
      req.session.checkout = true;
      let fullPrice = totalPrice - totalDiscount;
      res.render("user/checkout", {
        coupons,
        cart,
        items,
        totalPrice,
        total: cart.total,
        totalDiscount,
        address,
        fullPrice,
      });
    } catch (e) {
      console.error(e);
      res.redirect("/user/homepage");
    }
  },

  addressDefault: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let id = req.params.id;
      console.log(req.body.main);
      const addressIndex = user.Address.findIndex(
        (a) => a._id.toString() === id
      );
      user.Address[addressIndex].main = true;
      user.Address.forEach((item, index) => {
        if (index !== addressIndex) {
          item.main = false;
        }
      });
      await user.save();
      res.redirect("/user/checkout");
    } catch (e) {
      console.error(e);
    }
  },
  addressEdit: async (req, res) => {
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
      res.redirect("/user/checkout");
    } else {
      console.log("Address Not Found");
      res.redirect("/user/checkout");
    }
  },
  addressDelete: async (req, res) => {
    const addressId = req.params.id;
    console.log("address id is to delete", addressId);
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return res.redirect("/user/checkout");
      }
      const addressIndex = user.Address.findIndex(
        (a) => a._id.toString() === addressId
      );
      if (addressIndex === -1) {
        console.log("Address not found");
        return res.redirect("/user/checkout");
      }
      user.Address.splice(addressIndex, 1);
      if (user.Address.length === 1) user.Address[0].main = true;
      await user.save();
      console.log("Address deleted successfully");
      return res.redirect("/user/checkout");
    } catch (error) {
      console.error("Error deleting address:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  },
  applyCoupon: async (req, res) => {
    const { code, fullPrice } = req.body;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let cart = await Cart.findOne({ userId: user._id }).populate(
      "items.productId"
    );
    const now = new Date();
    let coupon = await Coupon.findOne({
      code: code,
      start: { $lt: now },
      end: { $gt: now },
      count: { $gt: 0 },
      status: true,
    });
    if (!coupon) {
      return res.status(401).json({
        status: false,
        message: "the coupon is not available right now",
      });
    }
    if (coupon.minPurchase > fullPrice) {
      res.status(401).json({
        status: false,
        message: `didn't reach coupon minimun purchase`,
      });
    }
    if (coupon.maxPurchase < fullPrice) {
      res.status(401).json({
        status: false,
        message: `amount exceeded coupon limit`,
      });
    }
    let ID = coupon._id;

    const couponDiscount = coupon.discount;
    console.log(couponDiscount, fullPrice);
    const fullDiscount = fullPrice * (couponDiscount / 100);
    const finalPrice = fullPrice - fullDiscount;
    coupon.count--;
    req.session.totalPrice = finalPrice;
    cart.coupon = coupon._id;
    console.log(finalPrice, fullPrice, fullDiscount);
    await cart.save();
    await coupon.save();
    res.status(200).json({
      status: true,
      message: "coupon applied",
      finalPrice,
      couponDiscount,
      ID,
    });
  },
  removeCoupon: async (req, res) => {
    let id = req.params.id;
    let cart = await Cart.findById(id);
    cart.coupon = null;
    res
      .status(200)
      .json({ status: true, message: "coupon removed successfully" });
  },
};
