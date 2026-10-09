const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

// Counts every request, successful or not, so the reset form can't be used to spam inboxes
const forgotLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many reset requests. Please try again in 15 minutes." },
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;