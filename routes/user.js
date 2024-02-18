const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")



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

module.exports = router;