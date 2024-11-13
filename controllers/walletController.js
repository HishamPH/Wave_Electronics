const User = require("../models/users");

const Products = require('../models/product');

const Wallet = require('../models/wallet')

module.exports = {
  getWallet:async(req,res)=>{
    try{
      let email = req.session.user.username;
      let user = await User.findOne({email:email})
      let wallet = await Wallet.findOne({userId:user._id})
      //wallet.balance = 10000;
      await wallet.save()
      let q = req.session.cartCount;
      res.render('user/wallet',{wallet,q});
    }catch(e){
      console.error(e);
      console.log('catch in getWallet in wallet.js')
    }
  }
}