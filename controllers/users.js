const User = require("../models/users");

const Products = require('../models/product')
const OTP = require('../models/otp')
const otpFunc = require('../utility/otpfunctions')

module.exports = {
  getLandPage:async(req,res)=>{
    let pd = await Products.find()
    res.render('user/landpage',{pd});
  },
  getHomePage:async(req,res)=>{
    let pd = await Products.find()
    console.log('getting home page')
    if(req.session.user){
      console.log('got home page',req.session.user)
      res.render('user/homepage',{message:req.session.name,pd});
    }

      
  },
  getLogin:(req,res)=>{
    res.render('user/user_login');
  },
  postLogin:async(req,res)=>{
    let a=await User.findOne({email:req.body.username})
    let pd = await Products.find();
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
    const  otp  = req.body.otp;
    const Email = req.session.user.email;
    const matchedOTPrecord = await OTP.findOne({
        Email: Email,
    })
    console.log('hello')
    // const { expiresAt } = matchedOTPrecord;
    // if (expiresAt) {
    //     if (expiresAt < Date.now()) {
    //         await OTP.deleteOne({ Email: Email });
    //         throw new Error("The OTP code has expired. Please request a new one.");
    //     }
    // } else {
    //     console.log("ExpiresAt is not defined in the OTP record.");
    // }
    if (Number(otp) == matchedOTPrecord.otp) {
        console.log('not hello')
        req.session.OtpValid = true;
        let data = await User.create(req.session.user)
        req.session.name = data.name
        res.redirect('/user/homepage')
    } else {
        console.log("Entered OTP does not match stored OTP.");
        req.flash("error", "Invalid OTP. Please try again.");
        res.redirect("/user/emailverification");
    }
  },
  getDetailPage:async(req,res)=>{
    let id = req.params.id;
    let pd = await Products.findById(id);
    res.render('user/productdetail',{pd})
  }
}

