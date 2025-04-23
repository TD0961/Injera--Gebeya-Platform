const express = require("express");
const { signupUser } = require("../controllers/userSignupController");
const { loginUser } = require("../controllers/userLoginController");
const { forgotPassword } = require("../controllers/resetPasswordcontroller"); // Ensure this path is correct

const router = express.Router();

// Signup route
router.post("/signup", signupUser);

// Login route
router.post("/login", loginUser);

// Forgot password route
router.post("/forgot-password", forgotPassword);

module.exports = router;