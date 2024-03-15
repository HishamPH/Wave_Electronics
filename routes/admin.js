const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")
const {uploadImage,resizeImage} = require('../middlewares/multer')

const orderController = require('../controllers/orders')
const couponController = require('../controllers/coupon')


// --------------------------Userlist----------------------------------

router.route('/users')
    .get(adminController.getUser)

router.route('/users/:id')
    .get(adminController.blockUser)

//---------------------Category---------------------
router.get('/category',Category.category);

router.get('/addcategory',Category.addCategory);

router.post('/addcategory',Category.postAddCategory);

router.route('/editcategory/:id')
.get(Category.getEditCategory)
.post(Category.postEditCategory)

router.get('/category/delete/:id',Category.deleteCategory);

// -------------------------------product-----------------------------------------------------

router.route("/products")
.get(productController.getProduct)

router.route("/addproduct")
.get(productController.getAddProduct)
.post(uploadImage,productController.postAddProduct)

router.route('/products/block/:id')
.get(productController.blockProduct)

// router.route('/viewproductdetails/:_id')
// .get(productController.getviewProductDetails)

router.route('/editproduct/:id')
.get(productController.getEditProduct)
.post(uploadImage,productController.postEditProduct)

//--------------------------orders---------------------

router.route('/orders')
.get(orderController.getAdminOrders)


router.route('/orders/changestatus/:id')
.post(orderController.changeStatus)

router.route('/orderdetails/:id')
.get(orderController.adminOrderDetails)

//==================== Coupons =======================

router.route('/coupons')
.get(couponController.getCoupon)


router.route('/coupons/addcoupon')
.post(couponController.addCoupon)

router.route('/coupons/edit/:id')
.post(couponController.editCoupon)

//===================== Offers ==========================

router.route('/offers')
.get(couponController.getOffers)

module.exports = router;