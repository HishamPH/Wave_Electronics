const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require('../controllers/product')

const cartController = require('../controllers/cart')
const orderController = require('../controllers/orders')

const walletController = require('../controllers/wallet')

const wishlistController = require('../controllers/wishlist')

//const checkoutAuth = require('../middlewares/userAuth')


router.route('/landpage')
.get(userController.getLandPage);


//======================= LOGIN ===========================

router.route('/login')
.get(userController.getLogin)
.post(userController.postLogin);

router.route('/homepage')
.get(userController.getHomePage);

router.route('/homepage/:id')
.get(userController.categorySort);




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


//====================== CART ===========================


router.route('/addtocart/:id')
.get(cartController.addToCart)

router.route('/cart')
.get(cartController.getCart)

router.route('/cart/coupon')
.post(cartController.applyCoupon)

router.route('/cart/:id')
.post(cartController.changeQuantity)

router.route('/cart/delete/:id')
.get(cartController.deleteFromCart)


//====================== Wish List ======================

router.route('/wishlist')
.get(wishlistController.getWishlist);

router.route('/wishlist/delete/:id')
.get(wishlistController.deleteWishlist)

router.route('/addwishlist/:id')
.get(wishlistController.wishlist)



//===================== CHECKOUT ======================

router.route('/checkout')
.get(cartController.getCheckout)

router.route('/checkout/address/change/:id')
.post(cartController.addressDefault)

router.route('/checkout/address/edit/:id')
.post(cartController.addressEdit)


router.route('/checkout/address/delete/:id')
.get(cartController.addressDelete)




//====================== orders ============================

router.route('/userprofile/orders')
.get(orderController.getUserOrders)


router.route('/placeorder/:id')
.post(orderController.placeOrder)

router.route('/paymentfailed/:id')
.get(orderController.paymentFailed)

router.route('/paymentsuccess')
.post(orderController.paymentSuccess)

router.route('/orders/cancelorders/:id')
.get(orderController.cancelOrders)

router.route('/orders/returnorder/:id')
.post(orderController.returnOrder)


router.route('/orderdetails/:id')
.get(orderController.userOrderDetails)

//===================== Profile ============================


router.route('/userprofile')
.get(userController.getProfile)

router.route('/userprofile/edit/:id')
.post(userController.editProfile)

router.route('/userprofile/changepassword/:id')
.post(userController.changePassword)


//======================== Wallet ======================

router.route('/wallet')
.get(walletController.getWallet)


//======================= Search ========================


router.route('/getsearch')
.get(userController.getSearch)


router.route('/search')
.get(userController.searchProduct)

router.route('/filters')
.post(userController.filterProducts)

//========================================================

module.exports = router;