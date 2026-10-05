const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    getConversations,
    getOrCreateConversation,
    getMessages,
} = require("../controllers/chatController");

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);

module.exports = router;