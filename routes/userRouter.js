const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const walletController = require("../controllers/walletController");
const wishlistController = require("../controllers/wishlistController");

const userAuth = require("../middlewares/userAuth");

//======================= LOGIN ===========================

router
  .route("/login")
  .get(userController.getLogin)
  .post(userController.postLogin);

router.get("/homepage", userAuth, userController.getHomePage);

router.get("/homepage/:id", userAuth, userController.categorySort);

//====================== SIGN UP =========================

router
  .route("/signup")
  .get(userController.getaddUser)
  .post(userController.postAddUser);

router
  .route("/emailverification")
  .get(userController.getEmailVerification)
  .post(userController.postEmailVerification);

router.route("/resendotp").get(userController.resendOTP);

//================== PRODUCT DETAILS =====================

router.get("/detail/:id", userAuth, userController.getDetailPage);

router.post("/review/:id", userAuth, userController.review);

//==================== USER PROFILE ====================

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

//====================== CART ===========================

router.get("/addtocart/:id", userAuth, cartController.addToCart);

router.get("/cart", userAuth, cartController.getCart);

router.post("/cart/coupon/:id", userAuth, cartController.applyCoupon);

router.post("/cart/:id", userAuth, cartController.changeQuantity);

router.get("/cart/delete/:id", userAuth, cartController.deleteFromCart);

//====================== Wish List ======================

router.get("/wishlist", userAuth, wishlistController.getWishlist);

router.get("/wishlist/delete/:id", userAuth, wishlistController.deleteWishlist);

router.get("/addwishlist/:id", userAuth, wishlistController.wishlist);

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

router.post("/paymentfailed/:id", userAuth, orderController.paymentFailed);

router.post("/paymentsuccess/:id", userAuth, orderController.paymentSuccess);

router.get("/orders/cancelorders/:id", userAuth, orderController.cancelOrders);

router.post("/orders/returnorder/:id", userAuth, orderController.returnOrder);

router.get("/orderdetails/:id", userAuth, orderController.userOrderDetails);

router.post(
  "/orders/continuepayment/:id",
  userAuth,
  orderController.continuePayment
);

//===================== Profile ============================

router.get("/userprofile", userAuth, userController.getProfile);

router.post("/userprofile/edit/:id", userAuth, userController.editProfile);

router.post(
  "/userprofile/changepassword/:id",
  userAuth,
  userController.changePassword
);

//======================== Wallet ======================

router.get("/wallet", userAuth, walletController.getWallet);

//======================= Search ========================

router.get("/getsearch", userAuth, userController.getSearch);

router.get("/search", userAuth, userController.searchProduct);

router.post("/filters", userAuth, userController.filterProducts);

//========================= Logout ======================

router.get("/logout", userController.logoutUser);

module.exports = router;
