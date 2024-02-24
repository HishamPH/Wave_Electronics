const User = require("../models/users");

const Products = require('../models/product')
const OTP = require('../models/otp')
const otpFunc = require('../utility/otpfunctions')

module.exports = {
  getLandPage:async(req,res)=>{
    let pd = await Products.find({Display:true})
    res.render('user/landpage',{pd});
  },
  getHomePage:async(req,res)=>{
    let pd = await Products.find({Display:true})
    // console.log('getting home page')
    if(req.session.user){
      // console.log('got home page',req.session.user)
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
    let  otp  = req.body.otp;
    console.log(otp.join(''));
    const Email = req.session.user.email;
    const matchedOTPrecord = await OTP.findOne({
        Email: Email,
    })
    // const { expiresAt } = matchedOTPrecord;
    // if (expiresAt) {
    //     if (expiresAt < Date.now()) {
    //         await OTP.deleteOne({ Email: Email });
    //         throw new Error("The OTP code has expired. Please request a new one.");
    //     }
    // } else {
    //     console.log("ExpiresAt is not defined in the OTP record.");
    // }
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
    let name = req.session.user.username;
    const user = await User.findOne({email:name})
    let address = user.Address
   
    res.render('user/userprofile',{address})
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

    // req.session.address = user.Address[addressIndex]

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
    const addressId = req.params.id; // Assuming you receive the address ID to delete from the request parameters

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

        user.Address.splice(addressIndex, 1); // Removing the address at the found index

        await user.save();

        console.log("Address deleted successfully");
        
        return res.redirect("/user/userprofile/address");
    } catch (error) {
        console.error("Error deleting address:", error.message);
        
        return res.status(500).send("Internal Server Error");
    }
  }
}

