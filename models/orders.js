const mongoose = require('mongoose');
const { Schema } = mongoose;

const shippedAddressSchema = new mongoose.Schema({

  name: { type: String, required: true },
  street: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  mobile: { type: Number, required: true }

});

const ordersSchema = new mongoose.Schema({
  userId:  { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: "Order Placed" },
  items: [{
    orderId:{type:String},
    productId: { type: Schema.Types.ObjectId, ref: "Products" },
    quantity: { type: Number },
    price:{type:Number},
    status:{type:String,default:"Order Placed"},
    confirmDate:{type:Date,default:null},
    returnDate:{type:Date,default:null},
    deliveryDate:{type:Date,default:null},
    returnReason:{type:String},
    paymentStatus:{type:String,default:'pending'}
  }],
  paymentMethod: { type: String },
  orderDate: { type: Date },
  totalPrice: { type: Number },
  paymentStatus: { type: String, default: "Pending" },
  Address: { type: shippedAddressSchema },
  coupon:{type: Schema.Types.ObjectId,ref: "Coupon",}
});

const Orders = mongoose.model('Orders', ordersSchema);

module.exports = Orders;