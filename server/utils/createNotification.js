const Notification = require("../models/Notification");

async function createNotification({ recipient, sender, type, text }) {
    if (recipient.toString() === sender.toString()) return;

    try {
        await Notification.create({ recipient, sender, type, text });
    } catch (err) {
        console.error("Failed to create notification:", err.message);
    }
}

module.exports = createNotification;