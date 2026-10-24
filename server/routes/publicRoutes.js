const express = require("express");
const User = require("../models/User");

const router = express.Router();

let cache = { data: null, at: 0 };
const CACHE_MS = 60 * 1000;

router.get("/stats", async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.at < CACHE_MS) {
      return res.json(cache.data);
    }

    const [students, teachers, alumni] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "alumni" }),
    ]);

    const data = { students, teachers, alumni, total: students + teachers + alumni };
    cache = { data, at: Date.now() };
    res.json(data);
  } catch (err) {
    console.error("Public stats error:", err.message);
    res.status(500).json({ message: "Could not load stats." });
  }
});

module.exports = router;