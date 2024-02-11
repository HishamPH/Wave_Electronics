const mongoose = require('mongoose');

//create a database schema 

const userschema= new mongoose.Schema({
  name:{
      type:String,
      required:true
  },
  email:{
      type:String,
      required:true
  },
  phone:{
      type:String,
      required:true
  },
  password:{
      type:String,
      required:true
  }
})

const User=mongoose.model('people',userschema)

module.exports = User;