const Product = require('../models/product')
const Category = require('../models/category')
const Offer = require('../models/offers')

module.exports = {
  getProduct:async(req,res)=>{
    let pd = await Product.find().populate('Category');
    pd.forEach(async(item)=>{
      if(item.stock===0)
        item.Status = 'Out of Stock'
      else
        item.Status = 'In Stock'
    })
    
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
    const categoryOffer = await Offer.findOne({ category: category._id });
    for (let i = 1; i <= 3; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName] && req.files[fieldName][0]) {
        images.push(req.files[fieldName][0].filename);
      }
    }
    const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";
    let amount = req.body.Price;
    let offerPrice;
   
    const discountPercentage = categoryOffer.percentage || 0;
    offerPrice = amount - (amount * (discountPercentage / 100)) - req.body.discount;
    console.log("offer price inside ADD NEW PRODUCT", offerPrice);
  
    const newProduct = new Product({
      ProductName: req.body.ProductName,
      Price: req.body.Price,
      Description: req.body.Description,
      stock: req.body.stock,
      Category: category._id,
      Status: Status,
      spec1: req.body.spec1,
      discount: req.body.discount,
      images: images,
      offer: categoryOffer ? categoryOffer._id : null,
      offerPrice:Math.floor(offerPrice)
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
    let pd =await Product.findById(id).populate('Category');
    res.render('admin/editproduct',{pd})
    console.log(pd.Category)
  },
  postEditProduct:async(req,res)=>{
    
    let id = req.params.id
    const images = [];
    const pd = await Product.findById(id);
    let cat = pd.Category;
    const category = await Category.findOne({ Name: req.body.Category});
    const categoryOffer = await Offer.findOne({ category:cat });
    for (let i = 1; i <= 3; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName] && req.files[fieldName][0]) {
            images.push(req.files[fieldName][0].filename);
      }
    }
    let insertImages = pd.images;
    if(images.length !== 0){
      insertImages = images;
    }
    const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";
    let amount = req.body.Price;
    let offerPrice;
    let discountPercentage = 0;
    if(categoryOffer)
      discountPercentage = categoryOffer.percentage;
    offerPrice = amount - (amount * (discountPercentage / 100))-req.body.discount;
    console.log("offer price inside ADD NEW PRODUCT", offerPrice);       
    await Product.findByIdAndUpdate(id,[{
     $set: {
      ProductName: req.body.ProductName,
      Price: Number(req.body.Price),
      Description: req.body.Description,
      stock: Number(req.body.stock),
      Status: Status,
      spec1: req.body.spec1,
      discount: Number(req.body.discount),
      offer: categoryOffer ? categoryOffer._id : null,
      offerPrice:Math.floor(offerPrice),
      images: insertImages
    }}]);
    res.redirect("/admin/products");
  }
}