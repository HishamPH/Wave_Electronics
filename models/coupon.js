const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const couponSchema = new mongoose.Schema({
  couponCount:{
    type:Number,
    required:true
  } ,
  code: {
    type: String,
    unique: true,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  minPurchase: {
    type: Number,
    required: true
  },
  start:{
    type: Date,
    required: true
  },
  expire: {
    type: Date,
    required: true
  },
  status:{
    type: String,
    default : "Active"
  },
  usedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
      },
      couponCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      }
    }
  ]
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;