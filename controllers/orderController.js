const Products = require("../models/product");
// const Coupon = require('../models/coupon')
const Cart = require("../models/cart");

const Order = require("../models/orders");
const User = require("../models/users");

const Wallet = require("../models/wallet");

require("dotenv").config();
const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = {
  placeOrder: async (req, res) => {
    try {
      let id = req.params.id;
      let cart = await Cart.findById(id).populate("items.productId coupon");
      let price = 0,
        discount = 0;
      console.log(req.body.method);
      cart.items.forEach(async (item) => {
        price += Number(item.productId.Price) * Number(item.quantity);
        discount += Number(item.productId.discount) * Number(item.quantity);
      });
      let coupon = cart.coupon ?? null;
      console.log("hello");
      let totalPrice = req.session.totalPrice ?? price - discount;
      let user = await User.findById(cart.userId);
      let adIndex = user.Address.findIndex((item) => item.main === true);
      let address = user.Address[adIndex];
      let date = new Date();
      const order = new Order({
        userId: cart.userId,
        items: cart.items,
        paymentMethod: "COD",
        orderDate: date,
        Address: address,
        totalPrice: totalPrice,
        coupon: coupon,
      });

      console.log(order._id);

      let status = true;
      if (req.body.method === "card") {
        var options = {
          amount: order.totalPrice * 100,
          currency: "INR",
          receipt: order._id,
        };
        let or = await new Promise((resolve, reject) => {
          instance.orders.create(options, (err, order) => {
            if (err) {
              reject(err);
            } else {
              resolve(order);
            }
          });
        });
        console.log(or);
        req.session.orderId = or.id;
        status = false;
        res.json({ status, or, order });
      } else {
        if (req.body.method === "wallet") {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (wallet.balance >= totalPrice) {
            wallet.transactions.push({
              type: "purchase",
              amount: totalPrice,
              date: Date.now(),
            });
            wallet.balance -= totalPrice;
            await wallet.save();
            order.paymentStatus = "success";
            order.paymentMethod = "Wallet";
          } else {
            res.json({ wallet: true });
          }
        }
        order.items.forEach(async (item) => {
          let pd = await Products.findById(item.productId._id);
          console.log(pd.stock);
          if (req.body.method === "wallet") {
            item.paymentStatus = "success";
          }
          pd.stock -= item.quantity;
          if (pd.stock === 0) pd.Status = "Out of stock";
          await pd.save();
        });
        cart.items = [];
        cart.total = 0;
        cart.coupon = null;
        req.session.cartCount = 0;
        req.session.totalPrice = null;
        await cart.save();
        await order.save();
        res.json({ status });
      }
    } catch (e) {
      console.error(e);
      console.log("this is the catch for placeOrder in order.js");
      res.redirect("/user/checkout");
    }
  },
  paymentSuccess: async (req, res) => {
    let or = req.body;
    let orderId = req.params.id;
    console.log(orderId);
    let cart = await Cart.findOne({ userId: or.userId }).populate(
      "items.productId"
    );
    let order = new Order({
      userId: or.userId,
      status: "Order Placed",
      items: or.items,
      paymentMethod: "razorpay",
      orderDate: or.orderDate,
      totalPrice: or.totalPrice,
      Address: or.Address,
      coupon: cart.coupon,
      paymentStatus: "success",
    });
    // order.items.forEach(async(item)=>{
    //   let pd = await Products.findById(item.productId._id);
    //   console.log(pd.stock)
    //   pd.stock -=  item.quantity;
    //   item.paymentStatus = 'success';
    //   if(pd.stock === 0)
    //     pd.Status = 'Out of stock';
    //   await pd.save();
    // });
    // await order.save();

    for (const item of order.items) {
      let pd = await Products.findById(item.productId._id);
      pd.stock -= item.quantity;
      item.orderId = orderId;
      item.paymentStatus = "success";
      if (pd.stock === 0) {
        pd.Status = "Out of stock";
      }
      await pd.save();
    }
    await order.save();

    cart.items = [];
    cart.total = 0;
    cart.coupon = null;
    req.session.cartCount = 0;
    await cart.save();
    res.json({ status: true });
  },
  paymentFailed: async (req, res) => {
    try {
      let orderId = req.params.id;
      console.log(orderId);
      let or = req.body;
      let cart = await Cart.findOne({ userId: or.userId }).populate(
        "items.productId"
      );
      let order = new Order({
        userId: or.userId,
        status: "Payment Failed",
        items: or.items,
        paymentMethod: "razorpay",
        orderDate: or.orderDate,
        totalPrice: or.totalPrice,
        Address: or.Address,
        coupon: cart.coupon,
        paymentStatus: "failed",
      });
      for (const item of order.items) {
        let pd = await Products.findById(item.productId._id);
        pd.stock -= item.quantity;
        item.orderId = orderId;
        item.status = "Payment Failed";
        item.paymentStatus = "failed";
        if (pd.stock === 0) {
          pd.Status = "Out of stock";
        }
        await pd.save();
      }
      await order.save();
      // order.items.forEach(async(item)=>{
      //   let pd = await Products.findById(item.productId._id);
      //   pd.stock -=  item.quantity;
      //   item.status = 'Payment Failed';
      //   item.paymentStatus = 'failed';
      //   console.log(item.status)

      //   if(pd.stock === 0)
      //     pd.Status = 'Out of stock';
      //   await pd.save();
      // });
      // console.log(order.items)
      // await order.save();
      cart.items = [];
      cart.total = 0;
      cart.coupon = null;
      req.session.cartCount = 0;
      await cart.save();
      res.json({ status: true });
    } catch (e) {
      console.log("this is the catch of payment failed");
      console.error(e);
    }
  },

  continuePayment: async (req, res) => {
    let id = req.params.id;
    console.log(req.body);
    let mainStatus = "Order Placed";
    let subStatus = "success";
    if (req.body.status == "failed") {
      mainStatus = "Payment Failed";
      subStatus = "failed";
    }
    let order = await Order.findOne({
      "items._id": id,
    }).populate("items.productId");
    let index = order.items.findIndex((a) => a._id.toString() === id);
    order.items[index].status = mainStatus;
    order.items[index].paymentStatus = subStatus;
    await order.save();
    res.json({ subStatus });
  },

  getUserOrders: async (req, res) => {
    try {
      let email = req.session.user.username ?? req.session.user.email;
      let user = await User.findOne({ email: email });
      let cart = await Cart.findOne({ userId: user._id });
      let orders = await Order.find({ userId: user._id })
        .populate("items.productId userId")
        .sort({ orderDate: -1 });
      let q = 0;
      if (cart !== null) q = cart.total ?? 0;
      let status = true;
      res.render("user/orders", { orders, q });
    } catch (e) {
      console.error(e);
      console.log("this is the catch for getUserOrders");
      res.redirect("/user/userprofile");
    }
  },
  getAdminOrders: async (req, res) => {
    let orders = await Order.find()
      .populate("items.productId userId")
      .sort({ orderDate: -1 });
    if (orders) res.render("admin/orders", { orders });
    else res.render("admin/orders");
  },
  changeStatus: async (req, res) => {
    let id = req.params.id;
    let order = await Order.findOne({
      "items._id": id,
    });
    let index = order.items.findIndex((a) => a._id.toString() === id);
    order.items[index].status = req.body.status;
    if (req.body.status === "delivered") {
      console.log("DELIVERED");
      order.items[index].paymentStatus = "success";
      order.items[index].deliveryDate = new Date();
      order.paymentStatus = "success";
    } else if (req.body.status === "confirmed") {
      order.items[index].confirmDate = new Date();
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
    res.render("admin/orderdetail", { items, address, tp });
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
      console.log(order.items[index].productId.ProductName + " was cancelled");
      res.redirect(`/user/orderdetails/${id}`);
    } catch (e) {
      console.error(e);
      res.redirect("/user/userprofile/orders");
    }
  },
  returnOrder: async (req, res) => {
    let reason = req.body.return;
    let id = req.params.id;
    let email = req.session.user.username;
    let user = await User.findOne({ email: email });
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
};
