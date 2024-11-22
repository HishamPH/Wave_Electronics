const mongoose = require("mongoose");
const offerSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 5 && value <= 40;
      },
      message: "Percentage must be between 5 and 40",
    },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: Boolean, default: true },
});

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
