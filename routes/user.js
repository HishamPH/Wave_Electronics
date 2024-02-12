const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")



router.route('/signup')
.get(userController.getaddUser)
.post(userController.postAddUser);


router.route('/homepage')
.get(userController.getHomePage);


router.route('/login')
.get(userController.getLogin)
.post(userController.postLogin);


router.route('/detail/:id')
.get(userController.getDetailPage);

module.exports = router;