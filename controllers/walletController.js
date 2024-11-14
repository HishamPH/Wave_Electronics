const User = require("../models/userModel");

const Products = require("../models/productModel");

const Wallet = require("../models/walletModel");

module.exports = {
  getWallet: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let wallet = await Wallet.findOne({ userId: user._id });
      //wallet.balance = 10000;
      await wallet.save();
      let q = req.session.cartCount;
      res.render("user/wallet", { wallet, q });
    } catch (e) {
      console.error(e);
      console.log("catch in getWallet in wallet.js");
    }
  },
};
