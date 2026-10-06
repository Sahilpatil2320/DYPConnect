const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getSuggestions, getProfile, updateProfile, searchUsers } = require("../controllers/userController");

router.get("/suggestions", protect, getSuggestions);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;