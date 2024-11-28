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
        variant,
      } = req.body;

      const files = req.files;
      mapFilesToVariants(variant, files);
      const cat = await Category.findOne({ categoryName: category });
      const defaultVariant = variant.find((item) => item.default);
      defaultPrice = Number(basePrice) + Number(defaultVariant?.price || 0);
      const product = await Product.create({
        productName,
        description,
        category: cat._id || null,
        spec1,
        spec2,
        spec3,
        basePrice,
        discount,
        variant: variant,
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
      variant,
    } = req.body;

    const files = req.files;
    mapFilesToVariants(variant, files);
    const cat = await Category.findOne({ categoryName: category });
    const defaultVariant = variant.find((item) => item.default);
    defaultPrice = Number(basePrice) + Number(defaultVariant?.price || 0);

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
          variant: variant,
          discount,
          defaultPrice,
        },
      },
    ]);
    return res
      .status(200)
      .json({ status: true, message: "product edited successfully" });
  },
  changeVariant: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { color, storage } = req.body;
      const pd = await Product.findById(id).populate("category");
      const currentVariant = pd.variant.find(
        (variant) => variant.color == color && variant.storage == storage
      );
      if (!currentVariant) {
        return res.status(404).json({
          status: false,
          message: "the selected variant is not available",
        });
      }

      const fullPrice =
        Number(pd.basePrice) + Number(currentVariant.price || 0);
      console.log(fullPrice);
      const offer = parseInt((pd.basePrice * pd.category?.offer) / 100) || 0;

      const discount = parseInt((pd.basePrice * pd.discount) / 100);
      const totalDiscount = Number(offer + discount);
      res.status(200).json({ fullPrice, currentVariant, totalDiscount });
    } catch (error) {
      next(error);
    }
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
    delete variant.imageNames;
  });
}
