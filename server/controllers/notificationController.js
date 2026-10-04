const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .populate("sender", "fullName")
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications.", error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: "Error updating notification.", error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.userId, read: false }, { read: true });
        res.json({ message: "All marked as read." });
    } catch (err) {
        res.status(500).json({ message: "Error updating notifications.", error: err.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.userId, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching unread count.", error: err.message });
    }
};