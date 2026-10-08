const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Connection = require("../models/Connection");
const { getConversationIfMember } = require("../utils/chatAccess");

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.userId })
            .populate("participants", "fullName role")
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (err) {
        console.error("Get conversations error:", err.message);
        res.status(500).json({ message: "Error fetching conversations." });
    }
};

exports.getOrCreateConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(recipientId) || recipientId === req.userId) {
            return res.status(400).json({ message: "Invalid recipient." });
        }

        const connected = await Connection.findOne({
            status: "accepted",
            $or: [
                { requester: req.userId, recipient: recipientId },
                { requester: recipientId, recipient: req.userId },
            ],
        });
        if (!connected) {
            return res.status(403).json({ message: "You can only message people you're connected with." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [req.userId, recipientId], $size: 2 },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.userId, recipientId],
            });
        }

        const populated = await conversation.populate("participants", "fullName role");
        res.json(populated);
    } catch (err) {
        console.error("Create conversation error:", err.message);
        res.status(500).json({ message: "Error creating conversation." });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const conversation = await getConversationIfMember(req.params.conversationId, req.userId);
        if (!conversation) {
            return res.status(403).json({ message: "Not authorized for this conversation." });
        }

        const messages = await Message.find({ conversation: conversation._id })
            .populate("sender", "fullName")
            .sort({ createdAt: 1 });

        await Message.updateMany(
            { conversation: conversation._id, sender: { $ne: req.userId }, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        console.error("Get messages error:", err.message);
        res.status(500).json({ message: "Error fetching messages." });
    }
};

exports.getUnreadMessageCount = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.userId }).select("_id");
        const conversationIds = conversations.map((c) => c._id);

        const count = await Message.countDocuments({
            conversation: { $in: conversationIds },
            sender: { $ne: req.userId },
            read: false,
        });

        res.json({ count });
    } catch (err) {
        console.error("Unread count error:", err.message);
        res.status(500).json({ message: "Error fetching unread count." });
    }
};