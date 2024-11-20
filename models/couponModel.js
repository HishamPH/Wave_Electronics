const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const couponSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      require: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    usedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
