const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")



router.route('/signup')
.get(userController.addUser)
.post(userController.postAddUser);

module.exports = router;