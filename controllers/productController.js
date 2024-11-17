const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Offer = require("../models/offerModel");

module.exports = {
  getProduct: async (req, res) => {
    let pd = await Product.find().populate("category");
    res.render("admin/products", { activePage: "products", pd });
  },
  getAddProduct: async (req, res) => {
    const cat = await Category.find();
    res.render("admin/addproduct", { activePage: "products", cat });
  },
  postAddProduct: async (req, res) => {
    try {
      const {
        category,
        productName,
        description,
        basePrice,
        spec1,
        spec2,
        spec3,
        discount,
        color,
        storage,
      } = req.body;
      const files = req.files;
      mapFilesToVariants(color, files);
      const cat = await Category.findOne({ categoryName: category });
      const categoryOffer = await Offer.findOne({ category: cat._id });

      const defaultColor = color.find((variant) => variant.default);
      const defaultStorage = storage.find((variant) => variant.default);
      defaultPrice =
        Number(basePrice) +
        Number(defaultColor?.price || 0) +
        Number(defaultStorage?.price || 0);

      const product = await Product.create({
        productName,
        description,
        basePrice,
        spec1,
        spec2,
        spec3,
        category: cat._id || null,
        offer: categoryOffer?._id || null,
        offerPrice: 1000,
        color: color,
        storage: storage,
        discount,
        defaultPrice,
      });

      return res
        .status(200)
        .json({ status: true, message: "product added successfully" });
    } catch (error) {
      console.log(error);
    }
  },
  blockProduct: async (req, res) => {
    let id = req.params.id;
    await Product.findByIdAndUpdate(id, [
      {
        $set: { status: { $not: "$status" } },
      },
    ]);
    res.redirect("/admin/products");
  },
  getEditProduct: async (req, res) => {
    let id = req.params.id;
    let pd = await Product.findById(id).populate("category");
    res.render("admin/editproduct", { activePage: "products", pd });
  },
  postEditProduct: async (req, res) => {
    let id = req.params.id;
    const {
      category,
      productName,
      description,
      basePrice,
      spec1,
      spec2,
      spec3,
      discount,
      color,
      storage,
    } = req.body;
    console.log(basePrice);
    const files = req.files;
    mapFilesToVariants(color, files);
    const cat = await Category.findOne({ categoryName: category });
    const categoryOffer = await Offer.findOne({ category: cat._id });

    const defaultColor = color.find((variant) => variant.default);
    const defaultStorage = storage.find((variant) => variant.default);
    defaultPrice =
      Number(basePrice) +
      Number(defaultColor?.price || 0) +
      Number(defaultStorage?.price || 0);

    await Product.findByIdAndUpdate(id, [
      {
        $set: {
          productName,
          description,
          basePrice,
          spec1,
          spec2,
          spec3,
          category: cat._id || null,
          offer: categoryOffer?._id || null,
          offerPrice: 1000,
          color: color,
          storage: storage,
          discount,

          defaultPrice,
        },
      },
    ]);
    return res
      .status(200)
      .json({ status: true, message: "product edited successfully" });
  },
  changeColor: async (req, res) => {
    try {
      const id = req.params.id;
      const { color, storage } = req.body;
      const pd = await Product.findById(id);
      const currentColor = pd.color.find(
        (variant) => variant.variant == color.variant
      );
      const currentStorage = pd.storage.find(
        (variant) => variant.variant == storage.variant
      );
      defaultPrice =
        Number(pd.basePrice) +
        Number(currentColor?.price || 0) +
        Number(currentStorage?.price || 0);
      res.status(200).json({ defaultPrice, currentColor, currentStorage });
    } catch (error) {
      console.log(error);
      res
        .status(401)
        .json({ status: false, message: "some error occured in change color" });
    }
  },
  changeStorage: async (req, res) => {
    const id = req.params.id;
    const { color } = req.body;
  },
};

function mapFilesToVariants(variants, files) {
  if (!Array.isArray(variants)) return;
  variants.forEach((variant, variantIndex) => {
    variant.images = variant.images || [];
    (variant.imageNames || []).forEach((imageName, imageIndex) => {
      if (!imageName || imageName === "false") {
        variant.images[imageIndex] = null;
      } else {
        const file = files.find((f) => f.fieldname === imageName);
        if (file) {
          variant.images[imageIndex] = file.filename;
        }
      }
    });

    // Remove the imageNames field (optional)
    delete variant.imageNames;
  });
}
