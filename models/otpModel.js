const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OTPSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;
