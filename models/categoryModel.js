const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
});

const Categories = mongoose.model("Categories", categorySchema);

module.exports = Categories;
