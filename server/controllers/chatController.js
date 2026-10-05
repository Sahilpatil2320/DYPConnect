const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.userId })
            .populate("participants", "fullName role")
            .sort({ lastMessageAt: -1 });
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: "Error fetching conversations.", error: err.message });
    }
};

exports.getOrCreateConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;

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
        res.status(500).json({ message: "Error creating conversation.", error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversation: req.params.conversationId })
            .populate("sender", "fullName")
            .sort({ createdAt: 1 });

        await Message.updateMany(
            { conversation: req.params.conversationId, sender: { $ne: req.userId }, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages.", error: err.message });
    }
};

exports.getUnreadMessageCount = async (req, res) => {
    try {
        const Message = require("../models/Message");
        const conversations = await Conversation.find({ participants: req.userId });
        const conversationIds = conversations.map((c) => c._id);

        const count = await Message.countDocuments({
            conversation: { $in: conversationIds },
            sender: { $ne: req.userId },
            read: false,
        });

        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching unread count.", error: err.message });
    }
};