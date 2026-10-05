const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getSuggestions, getProfile, updateProfile } = require("../controllers/userController");

router.get("/suggestions", protect, getSuggestions);
router.get("/:id", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;