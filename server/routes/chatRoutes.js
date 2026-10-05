const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    getConversations,
    getOrCreateConversation,
    getMessages,
    getUnreadMessageCount,
} = require("../controllers/chatController");

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);
router.get("/unread-count", protect, getUnreadMessageCount);

module.exports = router;