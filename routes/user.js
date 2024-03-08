const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require('../controllers/product')

const cartController = require('../controllers/cart')
const orderController = require('../controllers/orders')

//const checkoutAuth = require('../middlewares/userAuth')


router.route('/landpage')
.get(userController.getLandPage);


//======================= LOGIN ===========================

router.route('/login')
.get(userController.getLogin)
.post(userController.postLogin);

router.route('/homepage')
.get(userController.getHomePage);




//====================== SIGN UP =========================

router.route('/signup')
.get(userController.getaddUser)
.post(userController.postAddUser);


router.route('/emailverification')
.get(userController.getEmailVerification)
.post(userController.postEmailVerification)

router.route('/resendotp')
.get(userController.resendOTP)


//================== PRODUCT DETAILS =====================


router.route('/detail/:id')
.get(userController.getDetailPage);

router.route('/review/:id')
.post(userController.review)







//==================== USER PROFILE ====================

router.route('/userprofile/address')
.get(userController.getAddress)
.post(userController.postAddress)


router.route('/userprofile/address/setdefault/:id')
.post(userController.setDefault)


router.route('/userprofile/address/edit/:id')
.get(userController.getEditAddress)
.post(userController.postEditAddress)

router.route('/userprofile/address/delete/:id')
.get(userController.deleteAddress)


//================================ CART =========================================


router.route('/addtocart/:id')
.get(cartController.addToCart)

router.route('/cart')
.get(cartController.getCart)

router.route('/cart/:id')
.post(cartController.changeQuantity)

router.route('/cart/delete/:id')
.get(cartController.deleteFromCart)

//===================== CHECKOUT ======================

router.route('/checkout')
.get(cartController.getCheckout)

router.route('/checkout/changeAddress')


//====================== orders ============================

router.route('/userprofile/orders')
.get(orderController.getUserOrders)


router.route('/placeorder/:id')
.post(orderController.placeOrder)

router.route('/orders/cancelorders/:id')
.get(orderController.cancelOrders)


router.route('/userprofile')
.get(userController.getProfile)

router.route('/userprofile/edit/:id')
.post(userController.editProfile)

router.route('/userprofile/changepassword/:id')
.post(userController.changePassword)



//=============================================================

module.exports = router;