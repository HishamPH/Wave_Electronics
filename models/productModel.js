const mongoose = require('mongoose');
const {Schema,ObjectId} = mongoose 
const ProductsSchema = new mongoose.Schema({

  ProductName: {type: String,required: true},
  Price: {type: Number,required: true,
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: 'Price must be a positive number.'
    }
  },
  Description: {type: String,required: true},
  images: {type: Array,required: true},
  stock: {type: Number,
    validate: {
      validator: function(value) {
        return value >= 0; 
      },
      message: "Quantity Can't be less than 0"
    }
  },
  Category: {type:Schema.Types.ObjectId,required: true,ref: 'Categories'},
  discount: {type: Number,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= this.Price;
      },
      message: 'Discount amount must be less than the Price.'
    }
  },
  Display:{type:Boolean,reqired:true,default:true},
  Status: {type: String,required: true},
  spec1: {type: String},
  spec2: {type: String},
  rating:{type:Number},
  reviews:{type:Array},
  offer: {
    type: Schema.Types.ObjectId,
    ref: 'Offer',
  },
  offerPrice: {
    type: Number,
  },
  // reviews:[{
  //   userId:{type:Schema.Types.ObjectId,ref:'User'},
  //   review:[{type:String}]
  // }],
  // color:{type:String,default:'black'},
  // storage:{type:Number,default:128}
});

ProductsSchema.index({ProductName:'text'});

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;