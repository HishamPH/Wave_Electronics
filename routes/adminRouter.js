const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const { uploadImage } = require("../middlewares/multer");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const offerController = require("../controllers/offerController");
const adminAuth = require("../middlewares/adminAuth");

function checkAuthenticated(req, res, next) {
  if (req.cookies.adminAccessToken) {
    res.redirect("/admin/panel");
    return;
  }
  next();
}

//========================Dashboard======================

router.route("/").get(checkAuthenticated, adminController.getAdminLogin);
router.post("/login", adminController.postAdminLogin);
router.get("/panel", adminAuth, adminController.getDashboard);

//====================== Userlist ====================

router.get("/users", adminAuth, adminController.getUser);
router.get("/users/:id", adminAuth, adminController.blockUser);

//===================== Category =====================

router.get("/category", adminAuth, categoryController.getCategories);
router.post("/add-category", adminAuth, categoryController.postAddCategory);
router.post(
  "/edit-category/:id",
  adminAuth,
  categoryController.postEditCategory
);
router.delete(
  "/delete-category/:id",
  adminAuth,
  categoryController.deleteCategory
);

//======================== products ===================

router.get("/products", adminAuth, productController.getProduct);

router
  .route("/addproduct")
  .all(adminAuth)
  .get(productController.getAddProduct)
  .post(uploadImage, productController.postAddProduct);

router.get("/products/block/:id", adminAuth, productController.blockProduct);

// router.route('/viewproductdetails/:_id')
// .get(productController.getviewProductDetails)

router
  .route("/editproduct/:id")
  .all(adminAuth)
  .get(productController.getEditProduct)
  .post(uploadImage, productController.postEditProduct);

//=========================== ORDERS =====================

router.get("/orders", adminAuth, orderController.getAdminOrders);
router.post(
  "/orders/changestatus/:id",
  adminAuth,
  orderController.changeStatus
);

router.get("/orderdetails/:id", adminAuth, orderController.adminOrderDetails);

router.post(
  "/orders/returnorder/:id",
  adminAuth,
  orderController.returnApprove
);

//========================== COUPONS =======================

router.get("/coupons", adminAuth, couponController.getCoupon);
router.post("/coupons/addcoupon", adminAuth, couponController.addCoupon);
router.post("/coupons/edit/:id", adminAuth, couponController.editCoupon);
router.delete("/coupons/delete/:id", adminAuth, couponController.deleteCoupon);

//=========================== OFFERS =======================

router.get("/offers", adminAuth, offerController.getOffer);
router.post("/offers/addoffer", adminAuth, offerController.addOffer);
router.post("/offers/edit/:id", adminAuth, offerController.editOffer);

//============================= SALES ======================

router.get("/sales/:id", adminAuth, adminController.customSalesReport);
router.get("/sales", adminAuth, adminController.salesReport);

//============================ CHARTS ==================

router.get("/chart/:id", adminAuth, adminController.getChart);

//========================== Logout =====================

router.get("/logout", adminController.logoutAdmin);

module.exports = router;
