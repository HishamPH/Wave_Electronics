const mongoose = require('mongoose');
const {Schema,ObjectId} = mongoose 
const ProductsSchema = new mongoose.Schema({

  ProductName: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value > 0; // Ensuring Price is a positive number
      },
      message: 'Price must be a positive number.'
    }
  },
  Description: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
  stock: {
    type: Number,
    validate: {
      validator: function(value) {
        return value >= 0; // Validates that Quantity is greater than 0
      },
      message: "Quantity Can't be less than 0"
    }
  },
  Category: {
    type: Schema.Types.String,
    required: true,
    ref: 'Categories'
  },
  discount: {
    type: Number,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= this.Price; // Ensuring DiscountAmount is positive and less than or equal to Price
      },
      message: 'Discount amount must be a positive number and less than the Price.'
    }
  },
  Display:{
    type:Boolean,
    reqired:true,
    default:true
  },
  Status: {
    type: String,
    required: true
  },
  spec1: {
    type: String
  },
  spec2: {
    type: String
  },
  rating:{
    type:Number,
  },
  reviews:{
    type:String,
  }
});

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;