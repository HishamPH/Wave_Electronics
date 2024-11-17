const Category = require("../models/categoryModel");

module.exports = {
  category: async (req, res) => {
    const cat = await Category.find();
    res.render("admin/category", { activePage: "category", cat });
  },
  addCategory: (req, res) => {
    res.render("admin/addcategory", { activePage: "category" });
  },
  postAddCategory: async (req, res) => {
    try {
      const { categoryName } = req.body;
      console.log(categoryName);
      if (!categoryName || categoryName.trim() === "") {
        return;
      }
      const userData = await Category.create({ categoryName });
      console.log(userData);
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error);
    }
  },
  deleteCategory: async (req, res) => {
    let id = req.params.id;
    await Category.findByIdAndDelete(id);
    res.redirect("/admin/category");
  },
  getEditCategory: async (req, res) => {
    let id = req.params.id;
    let cat = await Category.findById(id);
    res.render("admin/editcategory", { activePage: "category", cat });
  },
  postEditCategory: async (req, res) => {
    let id = req.params.id;
    await Category.findByIdAndUpdate(id, [
      {
        $set: { categoryName: req.body.Name },
      },
    ]);
    res.redirect("/admin/category");
  },
};
