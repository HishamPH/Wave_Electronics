const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Products = require("../models/productModel");
const OTP = require("../models/otpModel");
const otpFunc = require("../utility/otpfunctions");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const Wallet = require("../models/walletModel");
const { loginAccessToken, loginRefreshToken } = require("../utility/jwtToken");

module.exports = {
  getLandPage: async (req, res) => {
    if (req.cookies.accessToken) {
      res.redirect("/user/homepage");
      return;
    }
    let pd = await Products.find({ status: true }).populate("offer").limit(8);
    pd.forEach((item) => {
      item.defaultVariant = item.variant.find((variant) => variant.default);
    });
    res.render("user/landpage", { pd });
  },

  getHomePage: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let pd = await Products.find({ status: true }).populate("offer").limit(8);
      let cat = await Category.find();
      let wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      let q = req.session.cartCount || 0;
      pd.forEach((item) => {
        item.defaultVariant = item.variant.find((variant) => variant.default);
      });
      res.render("user/homepage", {
        message: req.session.name,
        pd,
        q,
        cat,
        wishlist,
      });
    } catch (e) {
      console.error(e);
    }
  },

  categorySort: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = req.params.id;
    let pd = await Products.find({ Category: id });
    let cat = await Category.find();
    let wish = user.Wishlist;
    let wishlist = [];
    wish.forEach((item) => {
      wishlist.push(item.product.toString());
    });
    let q = req.session.cartCount || 0;
    let message = req.session.name;

    res.render("user/homepage", { message, pd, cat, q, wishlist });
  },

  getLogin: (req, res) => {
    res.render("user/user_login");
  },

  postLogin: async (req, res) => {
    try {
      let { username, password } = req.body;
      let user = await User.findOne({ email: username });
      let b;
      let isValid = false;
      if (user) {
        b = user.status ?? false;
        isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          req.session.message = {
            type: "success",
            message: "incorrect Password",
          };
          res.redirect("/user/login");
        }
      }
      if (!user) {
        req.session.message = {
          type: "success",
          message: "incorrect Username or Password",
        };
        res.redirect("/user/login");
      } else if (user.email == username && isValid) {
        req.session.result = req.body;
        req.session.name = user.name;
        let cart = await Cart.findOne({ userId: user._id });
        if (cart) req.session.cartCount = cart.total;
        const { _id, name, email, phone, status, Address, Wishlist } = user;
        const result = { _id, email };
        const accessToken = await loginAccessToken(result);
        const refreshToken = await loginRefreshToken(result);
        if (accessToken && refreshToken) {
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });
        }
        req.session.isUser = true;
        res.locals.isUser = true;
        res.redirect("/user/homepage");
      } else if (!b) {
        req.session.message = {
          type: "success",
          message: "This user isn't available right now",
        };
        console.log("heloo");
        res.redirect("/user/login");
      }
    } catch (e) {
      //res.redirect('/user/login')
      console.error(e);
    }
  },

  getaddUser: (req, res) => {
    res.render("user/user_signup");
  },

  postAddUser: async (req, res) => {
    email = req.body.email;
    const data = await User.findOne({ email });
    if (data != null) {
      req.session.message = {
        type: "success",
        message: "email is already existing",
      };
      res.redirect("/user/signup");
    }
    if (data == null) {
      req.session.result = req.body;
      let otpval = otpFunc.generateOTP();
      otpFunc.sendOTP(req, res, email, otpval);
      console.log(req.body);
      res.redirect("/user/emailverification");
    }
  },

  getEmailVerification: async (req, res) => {
    const Email = req.session.result.email;
    setTimeout(() => {
      OTP.deleteOne({ Email: Email })
        .then(() => {
          console.log("Document deleted successfully");
        })
        .catch((err) => {
          console.error(err);
        });
    }, 60000);
    res.render("user/emailverification");
  },

  postEmailVerification: async (req, res) => {
    console.log(req.body);
    let otp = req.body.otp;
    console.log(otp.join(""));
    const Email = req.session.result.email;
    const matchedOTPrecord = await OTP.findOne({
      Email: Email,
    });
    const { expiresAt } = matchedOTPrecord;
    if (expiresAt) {
      if (expiresAt < Date.now()) {
        await OTP.deleteOne({ Email: Email });
        throw new Error("The OTP code has expired. Please request a new one.");
      }
    } else {
      console.log("ExpiresAt is not defined in the OTP record.");
    }
    if (Number(otp.join("")) == matchedOTPrecord.otp) {
      req.session.OtpValid = true;
      let { name, email, phone, password } = req.session.result;
      let hash = await bcrypt.hash(password, 10);
      let user = new User({
        name,
        email,
        phone,
        password: hash,
      });
      await user.save();
      req.session.name = user.name;
      await Wallet.create({ userId: user._id });
      const { _id } = user;
      const result = { _id, email };
      const accessToken = await loginAccessToken(result);
      const refreshToken = await loginRefreshToken(result);
      if (accessToken && refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
      req.session.isUser = true;
      res.locals.isUser = true;
      res.redirect("/user/homepage");
    } else {
      console.log("Entered OTP does not match stored OTP.");
      res.redirect("/user/emailverification");
    }
  },

  resendOTP: async (req, res) => {
    let email = req.session.result.email;
    let a = await OTP.countDocuments();
    if (!a) {
      let otpval = otpFunc.generateOTP();
      otpFunc.sendOTP(req, res, email, otpval);
    }
    res.redirect("/user/emailverification");
  },

  getDetailPage: async (req, res) => {
    let id = req.params.id;
    let pd = await Products.findById(id).select("-__v");
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
  },

  review: async (req, res) => {
    let id = req.params.id;
    let review = req.body.review;
    await Products.updateOne(
      { _id: id },
      {
        $push: { reviews: review },
      }
    );
    res.redirect(`/user/detail/${id}`);
  },

  getAddress: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let address = user ? user.Address : null;
      let cart = await Cart.findOne({ userId: user._id });
      let q = cart ? cart.total : 0;
      if (address && address.length === 1) {
        user.Address[0].main = true;
        await user.save();
      }
      res.render("user/userprofile", { activePage: "address", address, q });
    } catch (e) {
      console.error(e);
      console.log("this is catch");
      let q = 0;
      res.render("user/userprofile", {
        activePage: "address",
        q,
        address: false,
      });
    }
  },

  setDefault: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = req.params.id;
    console.log(req.body.main);
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    user.Address[addressIndex].main = true;
    user.Address.forEach((item, index) => {
      if (index !== addressIndex) {
        item.main = false;
      }
    });
    await user.save();
    res.redirect("/user/userprofile/address");
  },

  postAddress: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let id = user._id;
    console.log(id);
    await User.findByIdAndUpdate(id, {
      $push: {
        Address: req.body,
      },
    });
    res.redirect("/user/userprofile/address");
  },

  getEditAddress: async (req, res) => {
    let id = req.params.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    let ad = user.Address[addressIndex];
    let address = user.Address;
    res.render("user/editaddress", { ad });
    console.log(ad);
  },

  postEditAddress: async (req, res) => {
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
      res.redirect("/user/userprofile/address");
    } else {
      console.log("Address Not Found");
      res.redirect("/user/userprofile/address");
    }
  },

  deleteAddress: async (req, res) => {
    const addressId = req.params.id;
    console.log("address id is to delete", addressId);
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return res.redirect("/user/userprofile/address");
      }
      const addressIndex = user.Address.findIndex(
        (a) => a._id.toString() === addressId
      );
      if (addressIndex === -1) {
        console.log("Address not found");
        return res.redirect("/user/userprofile/address");
      }
      user.Address.splice(addressIndex, 1);
      if (user.Address.length === 1) user.Address[0].main = true;
      await user.save();
      console.log("Address deleted successfully");
      return res.redirect("/user/userprofile/address");
    } catch (error) {
      console.error("Error deleting address:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  },

  getProfile: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    const q = req.session.cartCount;
    res.render("user/userdetail", { activePage: "profile", user, q });
  },

  editProfile: async (req, res) => {
    let id = req.params.id;
    console.log(req.body);
    const { name, phone } = req.body;
    let user = await User.findByIdAndUpdate(
      id,
      {
        name,
        phone,
      },
      { new: true }
    );
    req.session.name = user.name;
    res.redirect("/user/userprofile");
  },

  changePassword: async (req, res) => {
    try {
      let id = req.params.id;
      let { pass, pass1, pass2 } = req.body;
      let user = await User.findById(id);
      //let hash = await bcrypt.hash(pass,10);
      let isValid = await bcrypt.compare(pass, user.password);
      if (isValid) {
        if (pass1 === pass2) {
          let hash = await bcrypt.hash(pass1, 10);
          user.password = hash;
          await user.save();
          res.redirect("/user/userprofile");
        } else {
          res.json({ message: "your passwords do not match" });
        }
      } else {
        res.json({ message: "your typed the wrong password" });
      }
    } catch (e) {
      console.error(e);
      console.log("this is a password issue");
      res.json({ message: "password do not match" });
    }
  },

  getSearch: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let product = await Products.find({ Display: true }).limit(8);
      let cat = await Category.find();
      let wish = user.Wishlist;
      let wishlist = [];
      wish.forEach((item) => {
        wishlist.push(item.product.toString());
      });
      currentPage = 1;
      console.log(product.length);
      let noOfDocs = await Products.find({ Display: true }).countDocuments();

      let totalPages = Math.ceil(noOfDocs / 8);
      let q = req.session.cartCount || 0;
      res.render("user/searchresult", {
        message: req.session.name,
        product,
        q,
        cat,
        wishlist,
        currentPage,
        totalPages,
      });
    } catch (error) {
      console.log(error);
    }
  },
  searchProduct: async (req, res) => {
    let { q } = req.query;
    console.log(q);
    let products = await Products.find({
      ProductName: { $regex: new RegExp(q, "i") },
    });
    res.json({ products, q });
  },
  filterProducts: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    let wish = user.Wishlist;
    let wishlist = [];
    wish.forEach((item) => {
      wishlist.push(item.product.toString());
    });
    let filter = Object.keys(req.body);
    let page = req.query.page;
    let limit = 8;
    console.log(req.query);
    let search = req.query.name;
    let sort;
    let products = null;
    if (req.query.order == "lth") {
      sort = 1;
      products = await Products.find({
        Category: { $in: filter },
        ProductName: { $regex: new RegExp(search, "i") },
      })
        .sort({ Price: sort })
        .collation({ locale: "en", strength: 2 })
        .populate("offer")
        .skip((page - 1) * limit)
        .limit(limit);
    } else if (req.query.order == "htl") {
      sort = -1;
      products = await Products.find({
        Category: { $in: filter },
        ProductName: { $regex: new RegExp(search, "i") },
      })
        .sort({ Price: sort })
        .collation({ locale: "en", strength: 2 })
        .populate("offer")
        .skip((page - 1) * limit)
        .limit(limit);
    } else if (req.query.order == "az") {
      sort = 1;
      products = await Products.find({
        Category: { $in: filter },
        ProductName: { $regex: new RegExp(search, "i") },
      })
        .sort({ ProductName: sort })
        .collation({ locale: "en", strength: 2 })
        .populate("offer")
        .skip((page - 1) * limit)
        .limit(limit);
    } else if (req.query.order == "za") {
      sort = -1;
      products = await Products.find({
        Category: { $in: filter },
        ProductName: { $regex: new RegExp(search, "i") },
      })
        .sort({ ProductName: sort })
        .collation({ locale: "en", strength: 2 })
        .populate("offer")
        .skip((page - 1) * limit)
        .limit(limit);
    }

    res.json({ products, wishlist, page });
  },
  logoutUser: async (req, res) => {
    try {
      console.log("user logout", new Date());
      req.session.result = null;
      req.session.user = null;
      req.session.name = null;
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  },
};
