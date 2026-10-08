const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

// Returns the conversation only if this user is one of its participants.
async function getConversationIfMember(conversationId, userId) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;
    return Conversation.findOne({ _id: conversationId, participants: userId });
}

module.exports = { getConversationIfMember };