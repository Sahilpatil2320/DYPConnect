const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getSuggestions } = require("../controllers/userController");

router.get("/suggestions", protect, getSuggestions);

module.exports = router;