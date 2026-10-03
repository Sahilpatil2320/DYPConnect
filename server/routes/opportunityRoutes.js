const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createOpportunity,
    getOpportunities,
    applyToOpportunity,
} = require("../controllers/opportunityController");

router.get("/", getOpportunities);
router.post("/", protect, createOpportunity);
router.post("/:id/apply", protect, applyToOpportunity);

module.exports = router;