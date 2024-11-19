const mongoose = require("mongoose");
const { Schema, ObjectId } = mongoose;

const variantSchema = new Schema(
  {
    color: {
      type: String,
      required: true,
    },
    storage: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Quantity Can't be less than 0",
      },
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Price must be a positive number.",
      },
    },
    images: {
      type: [String],
      required: true,
    },
    default: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductsSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    status: { type: Boolean, default: true },
    spec1: { type: String },
    spec2: { type: String },
    spec3: { type: String },
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
    },
    basePrice: { type: Number, required: true },
    discount: { type: Number },
    offerPrice: {
      type: Number,
    },
    variant: [variantSchema],
    rating: { type: Number },
    reviews: { type: Array },
    defaultPrice: { type: Number },
  },
  {
    timestamps: true,
  }
);

ProductsSchema.index({ ProductName: "text" });
const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;
