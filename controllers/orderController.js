const Products = require("../models/productModel");
// const Coupon = require('../models/coupon')
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const { createOrder, verifyPayment } = require("../utility/payment");
const Review = require("../models/reviewModel");

module.exports = {
  placeOrder: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { method } = req.body;
      const cart = await Cart.findById(id);
      const totalPrice = req.session.totalPrice;
      const user = await User.findById(cart.userId);
      const adIndex = user.Address.findIndex((item) => item.main === true);
      const address = user.Address[adIndex];
      const date = new Date();
      const newOrder = new Order({
        userId: cart.userId,
        items: cart.items,
        paymentMethod: "COD",
        orderDate: date,
        Address: address,
        totalPrice: totalPrice,
        coupon: cart.coupon,
      });
      if (method === "card") {
        const { order, key } = await createOrder(totalPrice);
        if (order && key) {
          newOrder.orderId = order.id;
          newOrder.paymentMethod = "razorpay";
          await newOrder.save();
          req.session.orderId = newOrder._id;
          res.status(200).json({ status: true, type: "card", newOrder, key });
        } else {
          res
            .status(401)
            .json({ status: false, message: "order amount limit exceeds" });
        }
      } else {
        if (method === "wallet") {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (wallet.balance >= totalPrice) {
            wallet.transactions.push({
              type: "purchase",
              amount: totalPrice,
              date: Date.now(),
            });
            wallet.balance -= totalPrice;
            await wallet.save();
            newOrder.paymentStatus = "success";
            newOrder.paymentMethod = "Wallet";
            // return res
            //   .status(200)
            //   .json({ status: true, message: "Wallet Payment Successful" });
          } else {
            res
              .status(401)
              .json({ status: false, message: "not enough walled balance" });
          }
        }
        for (const item of newOrder.items) {
          let pd = await Products.findById(item.productId);
          const currentVariant = pd.variant.find(
            (variant) =>
              variant.color == item.color && variant.storage == item.storage
          );
          if (currentVariant.stock < item.quantity) {
            return res.status(401).json({
              status: false,
              message: `only ${currentVariant.stock} stock available for ${pd.productName}(${item.color},${item.storage})`,
            });
          }
          currentVariant.stock -= item.quantity;
          await pd.save();
          if (method === "wallet") {
            item.paymentStatus = "success";
          }
        }
        cart.items = [];
        cart.total = 0;
        cart.coupon = null;
        req.session.cartCount = 0;
        req.session.totalPrice = null;
        await cart.save();
        await newOrder.save();
        res.status(200).json({ status: true, message: "order placed" });
      }
    } catch (err) {
      console.error(err);
      console.log("this is the catch for placeOrder in order.js");
      next(err);
    }
  },
  paymentSuccess: async (req, res, next) => {
    try {
      const { order, paymentData } = req.body;
      const isVerified = await verifyPayment(paymentData);
      console.log(isVerified);
      const currentOrder = await Order.findById(order._id);
      let cart = await Cart.findOne({ userId: order.userId });
      if (isVerified) {
        currentOrder.paymentStatus = "success";
        for (const item of currentOrder.items) {
          let pd = await Products.findById(item.productId);
          const currentVariant = pd.variant.find(
            (variant) =>
              variant.color == item.color && variant.storage == item.storage
          );
          if (currentVariant.stock < item.quantity) {
            return res.status(401).json({
              status: false,
              message: `only ${currentVariant.stock} stock available for ${pd.productName}(${item.color},${item.storage})`,
            });
          }
          currentVariant.stock -= item.quantity;
          await pd.save();
          item.paymentStatus = "success";
        }
      } else {
        currentOrder.paymentStatus = "failed";
        currentOrder.status = "Payment Failed";
        for (const item of currentOrder.items) {
          item.paymentStatus = "failed";
        }
      }
      await currentOrder.save();
      cart.items = [];
      cart.total = 0;
      cart.coupon = null;
      req.session.cartCount = 0;
      await cart.save();
      res.status(200).json({ status: true, message: "payment completed" });
    } catch (error) {
      next(error);
    }
  },
  paymentFailed: async (req, res, next) => {
    try {
      const { order } = req.body;
      let cart = await Cart.findOne({ userId: order.userId });
      const currentOrder = await Order.findById(order._id);
      currentOrder.paymentStatus = "failed";
      currentOrder.status = "Payment Failed";
      for (const item of currentOrder.items) {
        item.paymentStatus = "failed";
        item.status = "Payment Failed";
      }
      await currentOrder.save();
      cart.items = [];
      cart.total = 0;
      cart.coupon = null;
      req.session.cartCount = 0;
      await cart.save();
      res.status(200).json({ status: true, message: "payment failed" });
    } catch (error) {
      next(error);
    }
  },

  continuePayment: async (req, res, next) => {
    try {
      let id = req.params.id;
      const { paymentStatus, paymentData } = req.body;
      // console.log(req.body);
      // let isVerified = false;
      // if (paymentData) {
      //   isVerified = await verifyPayment(paymentData);
      // }
      if (paymentStatus == "success") {
        const order = await Order.findOne({
          "items._id": id,
        }).populate("items.productId");
        const index = order.items.findIndex((a) => a._id.toString() === id);
        const currentOrder = order.items[index];
        const pd = await Products.findById(currentOrder.productId._id);
        const currentVariant = pd.variant.find(
          (variant) =>
            variant.color == currentOrder.color &&
            variant.storage == currentOrder.storage
        );
        if (currentVariant.stock < currentOrder.quantity) {
          return res.status(401).json({
            status: false,
            message: `stock not available for ${pd.productName}(${currentOrder.color},${currentOrder.storage})`,
            //message: `only ${currentVariant.stock} stock available for ${pd.productName}(${item.color},${item.storage})`,
          });
        }
        currentVariant.stock -= currentOrder.quantity;
        currentOrder.status = "Order Placed";
        currentOrder.paymentStatus = "success";
        await pd.save();
        await order.save();
        return res
          .status(200)
          .json({ status: true, message: "payment successful" });
      } else {
        return res
          .status(401)
          .json({ status: false, message: "payment failed" });
      }
    } catch (error) {
      next(error);
    }
  },

  getUserOrders: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      const cart = await Cart.findOne({ userId: user._id });
      const orders = await Order.find({ userId: user._id })
        .populate("items.productId userId")
        .sort({ orderDate: -1 });
      res.render("user/orders", { activePage: "orders", orders });
    } catch (error) {
      next(error);
    }
  },
  getAdminOrders: async (req, res) => {
    let orders = await Order.find()
      .populate("items.productId userId")
      .sort({ orderDate: -1 });
    if (orders) res.render("admin/orders", { activePage: "orders", orders });
    else res.render("admin/orders", { activePage: "orders" });
  },
  changeStatus: async (req, res) => {
    let id = req.params.id;
    const { status } = req.body;
    let order = await Order.findOne({
      "items._id": id,
    });
    let index = order.items.findIndex((a) => a._id.toString() === id);
    order.items[index].status = req.body.status;
    if (status === "delivered") {
      console.log("DELIVERED");
      order.items[index].paymentStatus = "success";
      order.items[index].deliveryDate = new Date();
      order.paymentStatus = "success";
    } else if (status === "confirmed") {
      order.items[index].confirmDate = new Date();
    } else if (status == "shipped") {
      order.items[index].shippedDate = new Date();
    }

    await order.save();
    res.redirect(`/admin/orderdetails/${order._id}`);
  },
  adminOrderDetails: async (req, res) => {
    let id = req.params.id;
    let order = await Order.findById(id).populate("items.productId");
    let address = order.Address;
    let items = order.items;
    let tp = order.totalPrice;
    res.render("admin/orderdetail", {
      activePage: "orders",
      items,
      address,
      tp,
    });
  },
  userOrderDetails: async (req, res) => {
    try {
      let id = req.params.id;
      let order = await Order.findOne({
        "items._id": id,
      }).populate("items.productId coupon");
      let address = order.Address;
      let index = order.items.findIndex((a) => a._id.toString() === id);
      let pd = order.items[index];
      let q = req.session.cartCount;
      let orderDate = order.orderDate.toLocaleString("en-US", {
        dateStyle: "long",
      });

      let date = order.items[index].deliveryDate;
      let checkDate = false;
      if (date) {
        checkDate = new Date(date.getTime() + 3600 * 1000);
      }
      console.log(checkDate);
      console.log(orderDate);
      let coupon = 0;
      if (order.coupon) coupon = order.coupon.discount;
      res.render("user/orderdetail", {
        activePage: "orders",
        pd,
        address,
        q,
        orderDate,
        checkDate,
        coupon,
      });
    } catch (e) {
      res.redirect("/user/userprofile/orders");
      console.error(e);
    }
  },
  cancelOrders: async (req, res) => {
    try {
      let id = req.params.id;
      let order = await Order.findOne({
        "items._id": id,
      }).populate("items.productId coupon");
      let index = order.items.findIndex((a) => a._id.toString() === id);
      if (order.items[index].paymentStatus === "success") {
        let coupon = 0;
        if (order.coupon) coupon = order.coupon.discount;
        let q = order.items[index].quantity;
        let price = order.items[index].price;

        let returnPrice = Math.floor((price - (price * coupon) / 100) * q);

        let wallet = await Wallet.findOneAndUpdate(
          { userId: order.userId },
          {
            $push: {
              transactions: {
                type: "refund",
                amount: returnPrice,
                date: Date.now(),
              },
            },
          }
        );
      }

      let pd = await Products.findById(order.items[index].productId._id);
      pd.stock += order.items[index].quantity;
      await pd.save();
      order.items[index].status = "cancelled";
      await order.save();
      console.log(order.items[index].productId.productName + " was cancelled");
      return res
        .status(200)
        .json({ status: true, message: "the order was cancelled" });
    } catch (error) {
      next(error);
    }
  },
  returnOrder: async (req, res) => {
    let reason = req.body.return;
    let id = req.params.id;

    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let order = await Order.findOne({
      userId: user._id,
      "items._id": id,
    });
    let index = order.items.findIndex((a) => a._id.toString() === id);

    order.items[index].status = "return request";
    order.items[index].returnReason = reason;
    await order.save();
    res.redirect(`/user/orderdetails/${id}`);
  },
  returnApprove: async (req, res) => {
    console.log(req.body);
    let id = req.params.id;

    let order = await Order.findOne({
      "items._id": id,
    }).populate("coupon");
    let index = order.items.findIndex((a) => a._id.toString() === id);
    if (req.body.approve) {
      let pd = await Products.findById(order.items[index].productId._id);
      pd.stock += order.items[index].quantity;
      await pd.save();
      let coupon = 0;
      if (order.coupon) coupon = order.coupon.discount;
      let q = order.items[index].quantity;
      let price = order.items[index].price;
      let returnPrice = Math.floor((price - (price * coupon) / 100) * q);
      order.items[index].status = "returned";
      let wallet = await Wallet.findOneAndUpdate(
        { userId: order.userId },
        {
          $push: {
            transactions: {
              type: "refund",
              amount: returnPrice,
              date: Date.now(),
            },
          },
        }
      );
      wallet.balance += order.items[index].price;
      order.items[index].returnDate = Date.now();
      await order.save();
      await wallet.save();
    } else {
      order.items[index].status = "return rejected";
      await order.save();
    }

    res.redirect(`/admin/orderdetails/${order._id}`);
  },
  reviewProduct: async (req, res, next) => {
    try {
      const itemId = req.params.id;
      const { rating, title, description } = req.body;

      const order = await Order.findOne({
        "items._id": itemId,
      });
      let itemIndex = order.items.findIndex((a) => a._id.toString() === itemId);
      const currentProduct = order.items[itemIndex];
      const review = await Review.create({
        userId: order.userId,
        productId: currentProduct.productId,
        storage: currentProduct.storage,
        color: currentProduct.color,
        rating: Number(rating),
        title,
        description,
      });
      return res
        .status(200)
        .json({ status: true, message: "product reviewed" });
    } catch (error) {
      next(error);
    }
  },
};
