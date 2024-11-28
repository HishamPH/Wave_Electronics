const Category = require("../models/categoryModel");

module.exports = {
  getCategories: async (req, res, next) => {
    try {
      const categories = await Category.find();
      res.render("admin/category", { activePage: "category", categories });
    } catch (error) {
      next(error);
    }
  },
  postAddCategory: async (req, res, next) => {
    try {
      const { category, offer } = req.body;

      if (!category || category.trim() === "") {
        return res.status(401).json({
          status: false,
          message: "category cannot be an empty string",
        });
      }
      const newCategory = await Category.create({
        categoryName: category,
        offer: Number(offer),
      });
      res.status(200).json({
        status: true,
        message: "category addedd successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  postEditCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { category, offer } = req.body;
      const newCategory = await Category.findByIdAndUpdate(
        categoryId,
        [
          {
            $set: { categoryName: category, offer: offer },
          },
        ],
        {
          new: true,
        }
      );
      res.status(200).json({
        status: true,
        newCategory,
        message: "category updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  blockCategory: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const newCategory = await Category.findByIdAndUpdate(
        categoryId,
        [
          {
            $set: { status: { $not: "$status" } },
          },
        ],
        {
          new: true,
        }
      );
      res.status(200).json({
        status: true,
        newCategory,
        message: "category updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
