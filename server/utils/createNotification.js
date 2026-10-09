const Notification = require("../models/Notification");

async function createNotification({ recipient, sender, type, text, post }) {
    if (!recipient || !sender) return;
    if (recipient.toString() === sender.toString()) return;

    try {
        // The same person liking the same post only notifies once
        if (type === "like" && post) {
            const existing = await Notification.findOne({ recipient, sender, type, post });
            if (existing) return;
        }

        await Notification.create({ recipient, sender, type, text, post });
    } catch (err) {
        console.error("Failed to create notification:", err.message);
    }
}

module.exports = createNotification;