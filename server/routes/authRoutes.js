const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middleWares/authMiddleware");
const { userSignup, userLogin, logoutUser, refreshAccessToken, googleSignin, forgotPassword, resetPassword, changePassword, updateProfile, verifyEmail, resendVerificationEmail, changeEmail } = require("../controller/authController");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

router.post("/register", authLimiter, userSignup);
router.post("/login", authLimiter, userLogin);
router.post("/logout", logoutUser);
router.get("/refresh", authLimiter, refreshAccessToken);
router.post("/google-signin", authLimiter, googleSignin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerificationEmail);
router.post("/change-email", protect, changeEmail);

module.exports = router;