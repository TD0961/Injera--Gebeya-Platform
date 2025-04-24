const express = require("express");
const { signupUser } = require("../controllers/userSignupController");
const { loginUser } = require("../controllers/userLoginController");
const { forgotPassword } = require("../controllers/forgotPasswordcontroller"); 
const { resetPassword } = require("../controllers/resetPasswordController");


const router = express.Router();

// Signup route
router.post("/signup", signupUser);

// Login route
router.post("/login", loginUser);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

module.exports = router;