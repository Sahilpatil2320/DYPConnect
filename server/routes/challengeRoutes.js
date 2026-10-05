const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getTodayQuestion, submitAnswer } = require("../controllers/challengeController");

router.get("/today", protect, getTodayQuestion);
router.post("/answer", protect, submitAnswer);

module.exports = router;