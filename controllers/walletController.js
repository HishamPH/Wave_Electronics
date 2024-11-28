const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

module.exports = {
  getWallet: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      let wallet = await Wallet.findOne({ userId: user._id });
      //wallet.balance = 10000;
      if (wallet && wallet.transactions && wallet.transactions.length > 0) {
        wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in descending order
      }
      res.render("user/wallet", { activePage: "wallet", wallet });
    } catch (error) {
      next(error);
    }
  },
};
