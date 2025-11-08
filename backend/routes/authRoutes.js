const express = require("express");
const router = express.Router();
// import controllers from authController
const { SignupControllers,
    LoginControllers } = require("../controllers/authController");

// all routes 
router.post("/signup", SignupControllers);
router.post("/login", LoginControllers)

module.exports = router

