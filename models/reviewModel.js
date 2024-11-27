const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    storage: { type: String, default: null },
    color: { type: String, required: true },
    rating: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
