const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require('../controllers/product')

const cartController = require('../controllers/cart')

router.route('/signup')
.get(userController.getaddUser)
.post(userController.postAddUser);


router.route('/emailverification')
.get(userController.getEmailVerification)
.post(userController.postEmailVerification)

router.route('/resendotp')
.get(userController.resendOTP)


router.route('/landpage')
.get(userController.getLandPage);

router.route('/homepage')
.get(userController.getHomePage);


router.route('/login')
.get(userController.getLogin)
.post(userController.postLogin);


router.route('/detail/:id')
.get(userController.getDetailPage);

router.route('/review/:id')
.post(userController.review)

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


router.route('/addtocart/:id')
.get(cartController.addToCart)

router.route('/cart')
.get(cartController.getCart)

router.route('/cart/:id')
.get(cartController.changeQuantity)

router.route('/cart/delete/:id')
.get(cartController.deleteFromCart)

module.exports = router;