const User = require("../models/users");

const Products = require('../models/product')

module.exports = {
  
  addUser:(req,res)=>{
    res.render("user/user_signup");
  },
  postAddUser:async(req,res)=>{
    const userData = await User.create(req.body);
    res.redirect('/login')
  },
  
}
