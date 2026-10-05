const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getTodayQuestion, submitAnswer, getStreak } = require("../controllers/challengeController");

router.get("/today", protect, getTodayQuestion);
router.get("/streak", protect, getStreak);
router.post("/answer", protect, submitAnswer);

module.exports = router;