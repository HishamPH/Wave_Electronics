const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
  },
  offer: {
    type: Number,
    validate: {
      validator: function (value) {
        return value <= 30;
      },
      message: "percentage must be less than 30",
    },
    default: 0,
  },
  offerStatus: { type: Boolean, default: true },
  status: { type: Boolean, default: true },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
