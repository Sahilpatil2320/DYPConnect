const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    sendRequest,
    getPendingInvitations,
    respondToRequest,
    getMyConnections,
} = require("../controllers/connectionController");

router.post("/", protect, sendRequest);
router.get("/invitations", protect, getPendingInvitations);
router.put("/:id/respond", protect, respondToRequest);
router.get("/", protect, getMyConnections);

module.exports = router;