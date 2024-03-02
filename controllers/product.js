const Product = require('../models/product')
const Category = require('../models/category')

module.exports = {
  getProduct:async(req,res)=>{
    let pd = await Product.find().populate('Category');
    res.render("admin/products",{pd});
  },
  getAddProduct: async (req, res) => {
    const cat = await Category.find();
    res.render("admin/addproduct",{cat});
  },
  postAddProduct: async (req, res) => {
    // console.log(req.files);
    const images = [];
    const category = await Category.findOne({ Name: req.body.Category});
    for (let i = 1; i <= 3; i++) {
        const fieldName = `image${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
            images.push(req.files[fieldName][0].filename);
        }
    }
    const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";       
    const newProduct = new Product({
        ProductName: req.body.ProductName,
        Price: req.body.Price,
        Description: req.body.Description,
        stock: req.body.stock,
        Category: category._id,
        Status: Status,
        spec1: req.body.spec1,
        discount: req.body.discount,
        images: images
    });
    await newProduct.save();
    res.redirect("/admin/products");
  },
  blockProduct:async(req,res)=>{
    let id = req.params.id;
    await Product.findByIdAndUpdate(id,[{
      $set:{Display:{$not:"$Display"}}
    }])
    res.redirect('/admin/products')
  },
  getEditProduct:async(req,res)=>{
    let id = req.params.id
    let pd =await Product.findById(id);
    let cat = await Category.find()
    res.render('admin/editproduct',{pd,cat})
  },
  postEditProduct:async(req,res)=>{
    let id = req.params.id
    const images = [];
    const category = await Category.findOne({ Name: req.body.Category});
    for (let i = 1; i <= 3; i++) {
        const fieldName = `image${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
            images.push(req.files[fieldName][0].filename);
        }
    }
    const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";       
    await Product.findByIdAndUpdate(id,[{
     $set: {
        ProductName: req.body.ProductName,
        Price: req.body.Price,
        Description: req.body.Description,
        stock: req.body.stock,
        Category: category._id,
        Status: Status,
        spec1: req.body.spec1,
        discount: req.body.discount,
        images: images
    }}]);
    res.redirect("/admin/products");
  }
}