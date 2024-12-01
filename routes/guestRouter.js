const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const guestController = require("../controllers/guestController");

function checkAuthenticated(req, res, next) {
  if (req.cookies.accessToken) {
    res.redirect("/user/homepage");
    return;
  }
  next();
}

router.get("/", checkAuthenticated, guestController.getLandPage);

router.get("/guest/getsearch", checkAuthenticated, guestController.getSearch);
router.post("/guest/filters", guestController.filterProducts);

router.get(
  "/guest/product-detail/:id",
  checkAuthenticated,
  guestController.getGuestDetailPage
);

module.exports = router;
