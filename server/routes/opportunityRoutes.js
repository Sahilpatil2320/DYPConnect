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

router.get("/", getOpportunities);
router.post("/", protect, createOpportunity);
router.post("/:id/apply", protect, applyToOpportunity);
router.get("/unseen-count", protect, getNewOpportunitiesCount);
router.put("/mark-visited", protect, markOpportunitiesVisited);

module.exports = router;