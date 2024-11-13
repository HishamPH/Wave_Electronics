const Category = require("../models/category");
const { rawListeners } = require("../models/users");

module.exports = {
  category : async(req,res)=>{
    const cat = await Category.find();
    
    res.render("admin/category",{cat});
  },
  addCategory:(req,res)=>{
    res.render("admin/addcategory");
  },
  postAddCategory:async(req,res)=>{
    const userData = await Category.create(req.body);
    res.redirect('/admin/category')
  },
  deleteCategory:async(req,res)=>{
    let id = req.params.id;
    await Category.findByIdAndDelete(id);
    res.redirect('/admin/category');
  },
  getEditCategory:async(req,res)=>{
    let id = req.params.id
    let cat = await Category.findById(id)
    res.render('admin/editcategory',{cat})
  },
  postEditCategory:async(req,res)=>{
    let id = req.params.id
    await Category.findByIdAndUpdate(id,[{
      $set:{Name:req.body.Name}
    }])
    res.redirect('/admin/category')
  }
}

