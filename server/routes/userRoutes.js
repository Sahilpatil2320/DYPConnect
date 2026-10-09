const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    getSuggestions,
    getMyStats,
    getProfile,
    updateProfile,
    searchUsers,
} = require("../controllers/userController");

// Specific routes first. "/:id" matches anything, so it must stay last.
router.get("/suggestions", protect, getSuggestions);
router.get("/search", protect, searchUsers);
router.get("/stats", protect, getMyStats);
router.put("/profile", protect, updateProfile);
router.get("/:id", protect, getProfile);

module.exports = router;