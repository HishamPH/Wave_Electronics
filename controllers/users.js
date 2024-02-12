const User = require("../models/users");

const Products = require('../models/product')

module.exports = {
  getHomePage:async(req,res)=>{
    let pd = await Products.find().limit(4)
    let name = req.session.username
    if(name!=='')
      res.render('user/homepage',{name,pd})
    else 
      res.render('user/homepage',{pd});
  },
  getLogin:(req,res)=>{
    res.render('user/user_login');
  },
  postLogin:async(req,res)=>{
    let a=await User.findOne({email:req.body.username})
    let pd = await Products.find();
    let b = a.status??false;
    if(a==null||!b){
      req.session.message={
          type:'success',
          message:"This user isn't available right now"
      }
      res.redirect('/user/homepage')
    }else if(a.email==req.body.username&&a.password==req.body.password){
      req.session.username=req.body.username
      req.session.name=a.name
      res.render('user/homepage',{
          message:req.session.name,
          pd
      }) 
    }else{
      req.session.message={
          type:'success',
          message:"incorrect username or password"
      }
      res.redirect('/user/homepage')
    }
  },
  getaddUser:(req,res)=>{
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
  },
  getDetailPage:async(req,res)=>{
    let id = req.params.id;
    let pd = await Products.findById(id);
    res.render('user/productdetail',{pd})
  }
}

