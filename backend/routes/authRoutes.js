const express = require("express");
const router = express.Router();
// import controllers from authController
const { SignupControllers,
    LoginControllers,
    ForgotPassword,
    ResetPassword
 } = require("../controllers/authController");

// all routes 
router.post("/signup", SignupControllers);
router.post("/login", LoginControllers);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);

module.exports = router

