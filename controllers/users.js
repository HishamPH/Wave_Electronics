const User = require("../models/users");

const Products = require('../models/product')

module.exports = {
  addUser:(req,res)=>{
    res.render("user/user_signup");
  },
  postAddUser:async(req,res)=>{
    const data= await User.findOne({email:req.body.email})
    if(data!=null){
      req.session.message={
        type:'success',
        message:"email is already existing"
      }
      res.redirect('/signup')
    } 
    if(data==null){
      const userData = await User.create(req.body);
      req.session.message={
        type:'success',
        message:"User Added Successfully"
      }
      res.redirect('/') 
    }
  }
}

