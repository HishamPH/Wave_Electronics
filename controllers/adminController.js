const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const { loginAccessToken, loginRefreshToken } = require("../utility/jwtToken");

module.exports = {
  getAdminLogin: async (req, res) => {
    res.render("admin/admin_login");
  },
  postAdminLogin: async (req, res) => {
    try {
      const { adminname, password } = req.body;
      const admin = await Admin.findOne({ email: adminname });
      if (!admin) {
        res.render("admin/admin_login", { message: `admin doesn't exist` });
        return;
      }
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        res.render("admin/admin_login", { message: `invalid credentials` });
        return;
      }
      const { _id, name, email } = admin;
      const result = { _id, name, email };
      req.session.admin = result;
      const accessToken = await loginAccessToken(result);
      const refreshToken = await loginRefreshToken(result);
      if (accessToken && refreshToken) {
        res.cookie("adminRefreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.cookie("adminAccessToken", accessToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
      res.redirect("/admin/panel");
    } catch (error) {
      console.error(error);
    }
  },
  getDashboard: async (req, res) => {
    let date = new Date();
    let lastMonth = new Date(date);
    lastMonth.setDate(lastMonth.getDate() - 10);
    let limit = 10;
    let order = await Order.find({
      orderDate: { $gte: lastMonth, $lte: date },
      "items.status": { $in: ["delivered", "return rejected"] },
    });
    let pdCount = [];
    let dates = [];
    for (let i = 1; i <= limit; i++) {
      let q = 0;
      order.forEach((item) => {
        const day1 = lastMonth.getDate();
        const day2 = item.orderDate.getDate();
        const datesMatch = day1 === day2;
        if (datesMatch) {
          item.items.forEach((row) => {
            q += row.quantity;
          });
        }
      });
      pdCount.push(q);
      dates.push(
        lastMonth.toLocaleDateString("en-US", { month: "long", day: "numeric" })
      );
      lastMonth.setDate(lastMonth.getDate() + 1);
    }
    let a = await Order.aggregate([
      {
        $match: {
          "items.status": { $in: ["delivered", "return rejected"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },

      { $sort: { totalQuantity: -1 } },

      { $limit: 3 },
    ]);
    let b = await Order.aggregate([
      {
        $match: {
          "items.status": { $in: ["delivered", "return rejected"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", // Name of the Product collection
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.Category",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]);
    let bestSellingProducts = [];
    let bestSellingCategories = [];
    let p1 = a.map(async (item) => {
      let x = await Products.findById(item._id);
      let obj = { pd: x, count: item.totalQuantity };
      bestSellingProducts.push(obj);
    });
    let p2 = b.map(async (item) => {
      let x = await Category.findById(item._id);
      let obj = { pd: x, count: item.totalQuantity };
      bestSellingCategories.push(obj);
    });
    await Promise.all(p1);
    await Promise.all(p2);
    res.render("admin/index", {
      activePage: "index",
      pdCount,
      dates,
      bestSellingProducts,
      bestSellingCategories,
      a,
      i: 1,
    });
  },
  getUser: async (req, res) => {
    const user = await User.find();
    res.render("admin/users", { activePage: "users", user });
  },

  blockUser: async (req, res) => {
    let id = req.params.id;
    await User.findByIdAndUpdate(id, [
      {
        $set: { status: { $not: "$status" } },
      },
    ]);
    res.redirect("/admin/users");
  },
  salesReport: async (req, res) => {
    let date = new Date();

    let lastMonth = new Date(date);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    let orders = await Order.find({
      orderDate: { $gte: lastMonth, $lte: date },
      "items.status": "delivered",
    })
      .populate("userId items.productId")
      .sort({ orderDate: -1 });
    let q = 0,
      tp = 0;
    let full_discount = 0;
    orders.forEach((item) => {
      item.items.forEach((order) => {
        q += order.quantity;
        full_discount += order.productId.discount;
      });
      tp += item.totalPrice;
    });
    res.render("admin/salesreport", {
      activePage: "sales",
      orders,
      q,
      tp,
      full_discount,
    });
  },
  customSalesReport: async (req, res) => {
    console.log(req.query);
    let { startDate, endDate } = req.query ?? null;
    let range = req.params.id;
    let date = new Date();
    let lastMonth = new Date();
    if (range === "month") {
      lastMonth = new Date(date);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
    } else if (range === "week") {
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - 7);
    } else if (range === "day") {
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - 1);
    } else if (range === "custom") {
      date = endDate;
      lastMonth = startDate;
    }
    let orders = await Order.find({
      orderDate: { $gte: lastMonth, $lte: date },
      "items.status": { $in: ["delivered", "return rejected"] },
    })
      .populate("userId items.productId")
      .sort({ orderDate: -1 });
    let q = 0,
      tp = 0;
    let full_discount = 0;
    orders.forEach((item) => {
      item.items.forEach((order) => {
        full_discount += order.productId.discount;
        q += order.quantity;
      });
      tp += item.totalPrice;
    });
    res.render("admin/salesreportcustom", {
      activePage: "sales",
      orders,
      q,
      tp,
      range,
      full_discount,
    });
  },
  getChart: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    let date = new Date();
    let lastMonth = new Date();
    let limit;
    if (id === "week") {
      limit = 7;
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - limit);
    } else if (id === "month") {
      limit = 28;
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - limit);
    } else if (id === "year") {
      limit = 12;
      let prev = date.getFullYear() - 1;
      lastMonth = new Date(prev, date.getMonth() + 1, date.getDate());
    }
    let order = await Order.find({
      orderDate: { $gte: lastMonth, $lte: date },
      "items.status": { $in: ["delivered", "return rejected"] },
    });
    let pdCount = [];
    let dates = [];
    if (limit === 12) {
      for (let i = 1; i <= limit; i++) {
        let q = 0;
        order.forEach((item) => {
          const month1 = lastMonth.getMonth();
          const month2 = item.orderDate.getMonth();
          const year1 = lastMonth.getFullYear();
          const year2 = item.orderDate.getFullYear();
          const datesMatch = month1 === month2 && year1 === year2;
          if (datesMatch) {
            item.items.forEach((row) => {
              q += row.quantity;
            });
          }
        });
        pdCount.push(q);

        dates.push(
          lastMonth.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        );
        lastMonth.setMonth(lastMonth.getMonth() + 1);
      }
    } else {
      for (let i = 1; i <= limit; i++) {
        let q = 0;
        order.forEach((item) => {
          const day1 = lastMonth.getDate();
          const day2 = item.orderDate.getDate();
          const datesMatch = day1 === day2;
          if (datesMatch) {
            item.items.forEach((row) => {
              q += row.quantity;
            });
          }
        });
        pdCount.push(q);

        dates.push(
          lastMonth.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })
        );
        lastMonth.setDate(lastMonth.getDate() + 1);
      }
    }

    let value = true;
    res.json({ value, pdCount, dates });
  },
  logoutAdmin: async (req, res) => {
    try {
      console.log("admin logout");
      req.session.admin = null;
      res.clearCookie("adminAccessToken");
      res.clearCookie("adminRefreshToken");
      res.redirect("/admin");
    } catch (error) {
      console.log(error);
    }
  },
};
