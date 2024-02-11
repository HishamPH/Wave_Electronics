const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")
const upload = require('../middlewares/multer')



// --------------------------Userlist----------------------------------

// router.route('/userslist')
//     .get(userController.getUser)

// router.route('/userlist/:_id')
//     .get(userController.blockUser)

//---------------------Category---------------------
router.get('/category',Category.category);

router.get('/addcategory',Category.addCategory);

router.post('/addcategory',Category.postAddCategory);

router.get('/category/delete/:id',Category.deleteCategory);

// -------------------------------product-----------------------------------------------------

// router.route("/product")
// .get(productController.getProduct)

router.route("/addproduct")
.get(productController.getAddProduct)
.post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postAddProduct)

// router.route('/product/:_id')
// .get(productController.blockProduct)

// router.route('/viewproductdetails/:_id')
// .get(productController.getviewProductDetails)

// router.route('/editproduct/:_id')
// .get(productController.getEditProduct)
// .post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postEditProduct)



module.exports = router;