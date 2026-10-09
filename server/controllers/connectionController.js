const mongoose = require("mongoose");
const Connection = require("../models/Connection");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

const PERSON_FIELDS = "fullName role department designation currentCompany";

exports.sendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(recipientId) || recipientId === req.userId) {
            return res.status(400).json({ message: "Invalid recipient." });
        }

        const recipient = await User.findById(recipientId).select("_id");
        if (!recipient) {
            return res.status(404).json({ message: "User not found." });
        }

        const existing = await Connection.findOne({
            $or: [
                { requester: req.userId, recipient: recipientId },
                { requester: recipientId, recipient: req.userId },
            ],
        });

        if (existing) {
            if (existing.status === "rejected") {
                // Older ignored invitations no longer block a new request
                await Connection.deleteOne({ _id: existing._id });
            } else {
                return res.status(400).json({ message: "A connection request already exists." });
            }
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
        console.error("Send request error:", err.message);
        res.status(500).json({ message: "Error sending request." });
    }
};

exports.getPendingInvitations = async (req, res) => {
    try {
        const invitations = await Connection.find({
            recipient: req.userId,
            status: "pending",
        })
            .populate("requester", PERSON_FIELDS)
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (err) {
        console.error("Get invitations error:", err.message);
        res.status(500).json({ message: "Error fetching invitations." });
    }
};

exports.getPendingInvitationsCount = async (req, res) => {
    try {
        const count = await Connection.countDocuments({ recipient: req.userId, status: "pending" });
        res.json({ count });
    } catch (err) {
        console.error("Invitations count error:", err.message);
        res.status(500).json({ message: "Error fetching count." });
    }
};

exports.respondToRequest = async (req, res) => {
    try {
        const { action } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Request not found." });
        }
        if (action !== "accept" && action !== "reject") {
            return res.status(400).json({ message: "Invalid action." });
        }

        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ message: "Request not found." });
        if (connection.recipient.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to respond to this request." });
        }
        if (connection.status !== "pending") {
            return res.status(400).json({ message: "This request has already been answered." });
        }

        if (action === "accept") {
            connection.status = "accepted";
            await connection.save();

            const accepter = await User.findById(req.userId).select("fullName");
            await createNotification({
                recipient: connection.requester,
                sender: req.userId,
                type: "connection_accepted",
                text: `${accepter.fullName} accepted your connection request`,
            });

            return res.json({ status: "accepted" });
        }

        // Ignoring simply removes the request, so either person can connect later
        await Connection.deleteOne({ _id: connection._id });
        res.json({ status: "ignored" });
    } catch (err) {
        console.error("Respond to request error:", err.message);
        res.status(500).json({ message: "Error responding to request." });
    }
};

exports.getMyConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            status: "accepted",
            $or: [{ requester: req.userId }, { recipient: req.userId }],
        })
            .populate("requester", PERSON_FIELDS)
            .populate("recipient", PERSON_FIELDS);

        const people = connections.map((c) =>
            c.requester._id.toString() === req.userId ? c.recipient : c.requester
        );

        res.json(people);
    } catch (err) {
        console.error("Get connections error:", err.message);
        res.status(500).json({ message: "Error fetching connections." });
    }
};

exports.getRecentlyAccepted = async (req, res) => {
    try {
        const recent = await Connection.find({
            requester: req.userId,
            status: "accepted",
        })
            .populate("recipient", PERSON_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json(recent);
    } catch (err) {
        console.error("Recent activity error:", err.message);
        res.status(500).json({ message: "Error fetching recent activity." });
    }
};