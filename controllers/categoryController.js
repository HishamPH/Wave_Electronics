const Category = require("../models/categoryModel");

module.exports = {
  getCategories: async (req, res, next) => {
    try {
      const cat = await Category.find();
      res.render("admin/category", { activePage: "category", cat });
    } catch (error) {
      next(error);
    }
  },
  postAddCategory: async (req, res, next) => {
    try {
      const { categoryName } = req.body;

      if (!categoryName || categoryName.trim() === "") {
        return;
      }
      const category = await Category.create({ categoryName });

      res.status(200).json({
        status: true,
        category,
        message: "category addedd successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      let id = req.params.id;
      await Category.findByIdAndDelete(id);
      res
        .status(200)
        .json({ status: true, message: "category deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
  postEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const { categoryName } = req.body;
      const category = await Category.findByIdAndUpdate(
        id,
        [
          {
            $set: { categoryName: categoryName },
          },
        ],
        {
          new: true,
        }
      );
      res.status(200).json({
        status: true,
        category,
        message: "category updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
