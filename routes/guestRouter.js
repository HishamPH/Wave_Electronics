const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/", userController.getLandPage);

module.exports = router;
