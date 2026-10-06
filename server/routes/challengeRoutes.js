const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getTodayQuestion, submitAnswer, getStreak, getLeaderboard, pauseTimer } = require("../controllers/challengeController");

router.get("/today", protect, getTodayQuestion);
router.get("/streak", protect, getStreak);
router.get("/leaderboard", protect, getLeaderboard);
router.post("/answer", protect, submitAnswer);
router.post("/pause", protect, pauseTimer);

module.exports = router;