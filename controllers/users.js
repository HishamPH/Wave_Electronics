const User = require("../models/users");

const Products = require('../models/product')
const OTP = require('../models/otp')
const otpFunc = require('../utility/otpfunctions')
const Cart = require('../models/cart')
const Category = require('../models/category')

module.exports = {
  getLandPage:async(req,res)=>{
    let pd = await Products.find({Display:true})
    res.render('user/landpage',{pd});
  },
  getHomePage:async(req,res)=>{
    let pd = await Products.find({Display:true})
    let cat = await Category.find()
    let q = req.session.cartCount||0;
    if(req.session.user){
      res.render('user/homepage',{message:req.session.name,pd,q,cat});
    } 
  },
  categorySort:async(req,res)=>{
    let id = req.params.id
    let pd = await Products.find({Category:id});
    let cat = await Category.find();
    let q = req.session.cartCount||0;
    let message = req.session.name;

    res.render('user/homepage',{message,pd,cat,q})
  },
  getLogin:(req,res)=>{
    res.render('user/user_login');
  },
  postLogin:async(req,res)=>{
    let a=await User.findOne({email:req.body.username})
    let pd = await Products.find();
    let cart = await Cart.findOne({userId :a._id})
    if(cart)
      req.session.cartCount = cart.total;
    let b;
    if(a)
      b = a.status??false;
    if(a==null||!b){
      req.session.message={
          type:'success',
          message:"This user isn't available right now"
      }
      res.redirect('/user/login')
    }else if(a.email==req.body.username&&a.password==req.body.password){
      req.session.user=req.body
      req.session.name=a.name
      res.redirect('/user/homepage') 
    }else{
      req.session.message={
          type:'success',
          message:"incorrect username or password"
      }
      res.redirect('/user/login')
    }
  },
  getaddUser:(req,res)=>{
    
    res.render("user/user_signup");
  },
  postAddUser:async(req,res)=>{
    email = req.body.email
    const data= await User.findOne({email})
    if(data!=null){
      req.session.message={
        type:'success',
        message:"email is already existing"
      }
      res.redirect('/user/signup')
    } 
    if(data==null){
      req.session.user = req.body;
      let otpval = otpFunc.generateOTP()
      otpFunc.sendOTP(req,res,email,otpval)
      console.log(req.body)
      // const userData = await User.create(req.body);
      // req.session.name = userData.name;
      // req.session.message={
      //   type:'success',
      //   message:"User Added Successfully"
      // }
      res.redirect('/user/emailverification') 
    }
  },
  getEmailVerification:async(req,res)=>{
    const Email = req.session.user.email;
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
  postEmailVerification:async(req,res)=>{
    console.log(req.body)
    let  otp  = req.body.otp;
    console.log(otp.join(''));
    const Email = req.session.user.email;
    const matchedOTPrecord = await OTP.findOne({
        Email: Email,
    })
    const { expiresAt } = matchedOTPrecord;
    if (expiresAt) {
        if (expiresAt < Date.now()) {
            await OTP.deleteOne({ Email: Email });
            throw new Error("The OTP code has expired. Please request a new one.");
        }
    } else {
        console.log("ExpiresAt is not defined in the OTP record.");
    }
    if (Number(otp.join('')) == matchedOTPrecord.otp) {
        req.session.OtpValid = true;
        let data = await User.create(req.session.user)
        req.session.name = data.name
        res.redirect('/user/homepage')
    } else {
        console.log("Entered OTP does not match stored OTP.");
        res.redirect("/user/emailverification");
    }
  },
  resendOTP:async(req,res)=>{
      let email = req.session.user.email
      let a = await OTP.countDocuments()
      if(!a){
        let otpval = otpFunc.generateOTP()
        otpFunc.sendOTP(req,res,email,otpval)
      }
      res.redirect('/user/emailverification') 
  },
  getDetailPage:async(req,res)=>{
    let id = req.params.id;
    let pd = await Products.findById(id);
    if(pd.stock === 0)
      pd.Status = 'Out of Stock';
    await pd.save()
    res.render('user/productdetail',{pd})
  },
  review:async(req,res)=>{
    let id = req.params.id
    let review = req.body.review
    await Products.updateOne({_id:id},{
      $push:{reviews:review}
    })
    res.redirect(`/user/detail/${id}`)
  },
  getAddress:async(req,res)=>{
    try{
      let name = req.session.user.username??req.session.user.email;
      const user = await User.findOne({email:name})
      let address = user?user.Address:null
      let cart = await Cart.findOne({userId:user._id})
      let q = cart?cart.total:0;
      if(address&&(address.length===1)){
        user.Address[0].main = true;
        await user.save()
      }
      res.render('user/userprofile',{address,q})
    }catch(e){
      console.error(e)
      console.log('this is catch')
      let q = 0;
      res.render('user/userprofile',{q,address:false})
    }
  },
  setDefault:async(req,res)=>{
    let user = await User.findOne({email:req.session.user.username})
    let id = req.params.id;
    console.log(req.body.main)
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    user.Address[addressIndex].main = true;
    user.Address.forEach((item,index)=>{
      if(index!==addressIndex){
        item.main = false;
      }
    })
    await user.save()
    res.redirect('/user/userprofile/address')
  },
  postAddress:async(req,res)=>{
    let user =await User.findOne({email:req.session.user.username})
    let id = user._id
    console.log(id)
    await User.findByIdAndUpdate(id,{
      $push:{ 
        Address:req.body
      }
    })
    res.redirect('/user/userprofile/address')
  },
  getEditAddress:async(req,res)=>{
    let id = req.params.id;
    let name = req.session.user.username;
    const user = await User.findOne({email:name})
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    let ad = user.Address[addressIndex]
    let address = user.Address
    res.render('user/editaddress',{ad})
    console.log(ad)
  },
  postEditAddress:async(req,res)=>{
    const addressId = req.params.id;
    const email = req.session.user.username;
   
    const user = await User.findOne({email:email})
    const { name, street, city, pincode,state,mobile } = req.body

    const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);
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
        console.log("Address Not Found")
        res.redirect("/user/userprofile/address");
    }
  },
  deleteAddress:async(req,res)=>{
    const email = req.session.user.username;
    const addressId = req.params.id; 
    console.log("address id is to delete", addressId)
    try {
        const user = await User.findOne({email:email});
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
        if(user.Address.length === 1)
          user.Address[0].main = true;
        await user.save();
        console.log("Address deleted successfully");
        return res.redirect("/user/userprofile/address");
    } catch (error) {
        console.error("Error deleting address:", error.message);
        return res.status(500).send("Internal Server Error");
    }
  },
  getProfile:async(req,res)=>{
    let email = req.session.user.username;
    let user = await User.findOne({email:email});
    let q = req.session.cartCount;
    res.render('user/userdetail',{user,q})
  },
  editProfile:async(req,res)=>{
    let id = req.params.id;
    let user = await User.findByIdAndUpdate(id,{
      name:req.body.name,
      email:req.body.email,
      phone:req.body.phone,
    })
    res.redirect('/user/userprofile')
  },
  changePassword:async(req,res)=>{
    try{
      let id = req.params.id;
      let user = await User.findById(id);
      if(req.body.pass === user.password){
        if((req.body.pass1 === req.body.pass2)){
          user.password = req.body.pass1;
          await user.save()
          res.redirect('/user/userprofile')
        }else{
          res.json({message:'your passwords do not match'})
        }  
      }else{
        res.json({message:'your typed the wrong password'})
      }
    }catch(e){
      console.error(e);
      console.log('this is a password issue')
      res.json({message:'password do not match'})
    }
    
  }
}

