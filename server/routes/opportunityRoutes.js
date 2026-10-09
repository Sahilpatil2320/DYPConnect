const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createOpportunity,
    getOpportunities,
    applyToOpportunity,
    getNewOpportunitiesCount,
    markOpportunitiesVisited,
} = require("../controllers/opportunityController");

router.get("/", protect, getOpportunities);
router.get("/unseen-count", protect, getNewOpportunitiesCount);
router.put("/mark-visited", protect, markOpportunitiesVisited);
router.post("/", protect, createOpportunity);
router.post("/:id/apply", protect, applyToOpportunity);

module.exports = router;