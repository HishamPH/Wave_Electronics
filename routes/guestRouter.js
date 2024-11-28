const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const guestController = require("../controllers/guestController");

router.get("/", userController.getLandPage);

router.get("/guest/getsearch", guestController.getSearch);
router.post("/guest/filters", guestController.filterProducts);

module.exports = router;
