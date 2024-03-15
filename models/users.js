const mongoose = require('mongoose');

//create a database schema 

const userschema= new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true},
  phone:{type:String,required:true},
  password:{type:String,required:true},
  status:{type:Boolean,default:true},
  Address: [{
    name: {type: String},
    street: {type: String},
    city: {type: String},
    pincode: {type: Number},
    state: {type: String},
    mobile: {type: Number},
    main:{type:Boolean,default:false}
  }],
  Wishlist:[{
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Products"
    }
  }]
})

const User=mongoose.model('User',userschema)

module.exports = User;