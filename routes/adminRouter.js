const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const { uploadImage } = require("../middlewares/multer");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const offerController = require("../controllers/offerController");

const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

function checkAuthenticated(req, res, next) {
  if (req.session.admin) {
    res.redirect("/admin/panel");
  }
  next();
}

//========================Dashboard======================

router.route("/").get(checkAuthenticated, adminController.getAdminLogin);

router.route("/login").post(adminController.postAdminLogin);

router.route("/panel").get(isAuthenticatedAdmin, adminController.getDashboard);
// --------------------------Userlist----------------------------------

router.route("/users").get(adminController.getUser);

router.route("/users/:id").get(adminController.blockUser);

//---------------------Category---------------------

router.get("/category", categoryController.category);

router.get("/addcategory", categoryController.addCategory);

router.post("/addcategory", categoryController.postAddCategory);

router
  .route("/editcategory/:id")
  .get(categoryController.getEditCategory)
  .post(categoryController.postEditCategory);

router.get("/category/delete/:id", categoryController.deleteCategory);

// -------------------------------product-----------------------------------------------------

router.route("/products").get(productController.getProduct);

router
  .route("/addproduct")
  .get(productController.getAddProduct)
  .post(uploadImage, productController.postAddProduct);

router.route("/products/block/:id").get(productController.blockProduct);

// router.route('/viewproductdetails/:_id')
// .get(productController.getviewProductDetails)

router
  .route("/editproduct/:id")
  .get(productController.getEditProduct)
  .post(uploadImage, productController.postEditProduct);

//--------------------------orders---------------------

router.route("/orders").get(orderController.getAdminOrders);

router.route("/orders/changestatus/:id").post(orderController.changeStatus);

router.route("/orderdetails/:id").get(orderController.adminOrderDetails);

router.route("/orders/returnorder/:id").post(orderController.returnApprove);

//==================== Coupons =======================

router.route("/coupons").get(couponController.getCoupon);

router.route("/coupons/addcoupon").post(couponController.addCoupon);

router.route("/coupons/edit/:id").post(couponController.editCoupon);

router.route("/coupons/delete/:id").get(couponController.deleteCoupon);

//===================== Offers ==========================

router.route("/offers").get(offerController.getOffer);

router.route("/offers/addoffer").post(offerController.addOffer);

router.route("/offers/edit/:id").post(offerController.editOffer);

//====================== Sales =========================

router.route("/sales/:id").get(adminController.customSalesReport);

router.route("/sales").get(adminController.salesReport);

//============================ Chart.js ==================

router.route("/chart/:id").get(adminController.getChart);

//========================== Logout =====================

router.get("/logout", adminController.logoutAdmin);

module.exports = router;
