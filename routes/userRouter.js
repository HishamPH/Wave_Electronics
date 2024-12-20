const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const wishlistController = require("../controllers/wishlistController");
const productController = require("../controllers/productController");
const searchController = require("../controllers/searchController");

const userAuth = require("../middlewares/userAuth");
function checkAuthenticated(req, res, next) {
  if (req.cookies.accessToken) {
    res.redirect("/user/homepage");
    return;
  }
  next();
}

//======================= LOGIN ===========================

router
  .route("/login")
  .get(checkAuthenticated, authController.getLogin)
  .post(authController.postLogin);

router
  .route("/signup")
  .get(checkAuthenticated, authController.getaddUser)
  .post(authController.postAddUser);

router.post("/email-verification", authController.postEmailVerification);

router.route("/resendotp").get(authController.resendOTP);

//====================== HOME PAGE =========================

router.get("/homepage", userAuth, userController.getHomePage);

//================== PRODUCT DETAILS =====================

router.get("/product-detail/:id", userAuth, productController.getDetailPage);

router.post("/product/change-variant/:id", productController.changeVariant);

//=================== ADDRESS MANAGEMENT ===================

router
  .route("/userprofile/address")
  .all(userAuth)
  .get(userController.getAddress)
  .post(userController.postAddress);

router.post(
  "/userprofile/address/setdefault/:id",
  userAuth,
  userController.setDefault
);

router
  .route("/userprofile/address/edit/:id")
  .all(userAuth)
  .get(userController.getEditAddress)
  .post(userController.postEditAddress);

router.get(
  "/userprofile/address/delete/:id",
  userAuth,
  userController.deleteAddress
);

//====================== PRODUCTS ======================

//====================== CART ===========================

router.post("/addtocart/:id", userAuth, cartController.addToCart);

router.get("/cart", userAuth, cartController.getCart);

router.post(
  "/cart/update-quantity/:id",
  userAuth,
  cartController.changeQuantity
);

router.delete("/cart/delete/:id", userAuth, cartController.deleteFromCart);

//=====================  COUPON ========================

router.post("/checkout/apply-coupon", userAuth, cartController.applyCoupon);

router.put("/checkout/remove-coupon", userAuth, cartController.removeCoupon);

//====================== Wish List ======================

router.get("/wishlist", userAuth, wishlistController.getWishlist);

router.get("/wishlist/delete/:id", userAuth, wishlistController.deleteWishlist);

router.post(
  "/update-wishlist/:id",
  userAuth,
  wishlistController.updateWishlist
);

//===================== CHECKOUT ======================

router.get("/checkout", userAuth, cartController.getCheckout);

router.post(
  "/checkout/address/change/:id",
  userAuth,
  cartController.addressDefault
);

router.post("/checkout/address/edit/:id", userAuth, cartController.addressEdit);

router.get(
  "/checkout/address/delete/:id",
  userAuth,
  cartController.addressDelete
);

//====================== orders ============================

router.get("/userprofile/orders", userAuth, orderController.getUserOrders);

router.post("/placeorder/:id", userAuth, orderController.placeOrder);

router.post("/payment-failed", userAuth, orderController.paymentFailed);

router.post("/payment-success", userAuth, orderController.paymentSuccess);

router.put("/order/cancel-order/:id", userAuth, orderController.cancelOrders);

router.post("/orders/returnorder/:id", userAuth, orderController.returnOrder);

router.get("/orderdetails/:id", userAuth, orderController.userOrderDetails);

router.post(
  "/orders/continue-payment/:id",
  userAuth,
  orderController.continuePayment
);

//===================== REVIEWS ========================

router.post("/review-product/:id", userAuth, orderController.reviewProduct);

//===================== Profile ============================

router.get("/userprofile", userAuth, userController.getProfile);

router.post("/userprofile/edit/:id", userAuth, userController.editProfile);

router.post(
  "/userprofile/changepassword/:id",
  userAuth,
  userController.changePassword
);

//======================== Wallet ======================

router.get("/wallet", userAuth, userController.getWallet);

//======================= Search ========================

router.get("/getsearch", userAuth, searchController.getSearch);

router.get("/search", userAuth, searchController.searchProduct);

router.post("/filters", userAuth, searchController.filterProducts);

//========================= Logout ======================

router.get("/logout", userController.logoutUser);

module.exports = router;
