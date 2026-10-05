const Connection = require("../models/Connection");
const createNotification = require("../utils/createNotification");
const User = require("../models/User");

exports.sendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;

        const existing = await Connection.findOne({
            $or: [
                { requester: req.userId, recipient: recipientId },
                { requester: recipientId, recipient: req.userId },
            ],
        });
        if (existing) {
            return res.status(400).json({ message: "A connection request already exists." });
        }

        const connection = await Connection.create({
            requester: req.userId,
            recipient: recipientId,
        });

        const requester = await User.findById(req.userId).select("fullName");
        await createNotification({
            recipient: recipientId,
            sender: req.userId,
            type: "connection_request",
            text: `${requester.fullName} sent you a connection request`,
        });

        res.status(201).json(connection);
    } catch (err) {
        res.status(500).json({ message: "Error sending request.", error: err.message });
    }
};

exports.getPendingInvitations = async (req, res) => {
    try {
        const invitations = await Connection.find({
            recipient: req.userId,
            status: "pending",
        }).populate("requester", "fullName role department designation");

        res.json(invitations);
    } catch (err) {
        res.status(500).json({ message: "Error fetching invitations.", error: err.message });
    }
};

exports.respondToRequest = async (req, res) => {
    try {
        const { action } = req.body; // "accept" or "reject"
        const connection = await Connection.findById(req.params.id);

        if (!connection) return res.status(404).json({ message: "Request not found." });
        if (connection.recipient.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to respond to this request." });
        }

        connection.status = action === "accept" ? "accepted" : "rejected";
        await connection.save();

        if (action === "accept") {
            const accepter = await User.findById(req.userId).select("fullName");
            await createNotification({
                recipient: connection.requester,
                sender: req.userId,
                type: "connection_accepted",
                text: `${accepter.fullName} accepted your connection request`,
            });
        }

        res.json(connection);
    } catch (err) {
        res.status(500).json({ message: "Error responding to request.", error: err.message });
    }
};

exports.getMyConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            status: "accepted",
            $or: [{ requester: req.userId }, { recipient: req.userId }],
        })
            .populate("requester", "fullName role department")
            .populate("recipient", "fullName role department");

        const formatted = connections.map((c) =>
            c.requester._id.toString() === req.userId ? c.recipient : c.requester
        );

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: "Error fetching connections.", error: err.message });
    }
};

exports.getPendingInvitationsCount = async (req, res) => {
    try {
        const count = await Connection.countDocuments({ recipient: req.userId, status: "pending" });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching count.", error: err.message });
    }
};

exports.getRecentlyAccepted = async (req, res) => {
    try {
        const recent = await Connection.find({
            requester: req.userId,
            status: "accepted",
        })
            .populate("recipient", "fullName role department designation currentCompany")
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json(recent);
    } catch (err) {
        res.status(500).json({ message: "Error fetching recent activity.", error: err.message });
    }
};