const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const CartSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref:"User"},
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Products",
      },
      quantity: {
        type: Number,
        //max:2
      },
      price:{type:Number}
    },
  ],
  total: {
    type: Number,
  },
  coupon:{
    type: Schema.Types.ObjectId,
    ref: "Coupon",
  }
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;