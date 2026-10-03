const Connection = require("../models/Connection");

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