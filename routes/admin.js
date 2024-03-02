const express = require('express');

const router = express.Router();

const Category = require('../controllers/category')

const adminController=require('../controllers/admin')
const userController = require('../controllers/users');
const productController=require("../controllers/product")
const upload = require('../middlewares/multer')

const orderController = require('../controllers/orders')



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
.post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postAddProduct)

router.route('/products/block/:id')
.get(productController.blockProduct)

// router.route('/viewproductdetails/:_id')
// .get(productController.getviewProductDetails)

router.route('/editproduct/:id')
.get(productController.getEditProduct)
.post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postEditProduct)

//--------------------------orders---------------------

router.route('/orders')
.get(orderController.getAdminOrders)


router.route('/orders/changestatus/:id')
.post(orderController.changeStatus)

router.route('/orderdetails/:id')
.get(orderController.adminOrderDetails)



module.exports = router;