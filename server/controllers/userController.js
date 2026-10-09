const mongoose = require("mongoose");
const User = require("../models/User");
const Connection = require("../models/Connection");
const Post = require("../models/Post");

const PUBLIC_PROFILE_FIELDS =
    "fullName role department year designation graduationYear currentCompany currentRole bio skills";

exports.getSuggestions = async (req, res) => {
    try {
        const existingConnections = await Connection.find({
            status: { $ne: "rejected" },
            $or: [{ requester: req.userId }, { recipient: req.userId }],
        });

        const excludedIds = new Set([req.userId]);
        existingConnections.forEach((c) => {
            excludedIds.add(c.requester.toString());
            excludedIds.add(c.recipient.toString());
        });

        const suggestions = await User.find({ _id: { $nin: Array.from(excludedIds) } })
            .select("fullName role department designation graduationYear currentCompany")
            .limit(10);

        res.json(suggestions);
    } catch (err) {
        console.error("Suggestions error:", err.message);
        res.status(500).json({ message: "Error fetching suggestions." });
    }
};

exports.getMyStats = async (req, res) => {
    try {
        const [connections, posts] = await Promise.all([
            Connection.countDocuments({
                status: "accepted",
                $or: [{ requester: req.userId }, { recipient: req.userId }],
            }),
            Post.countDocuments({ author: req.userId }),
        ]);
        res.json({ connections, posts });
    } catch (err) {
        console.error("Stats error:", err.message);
        res.status(500).json({ message: "Error fetching stats." });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = await User.findById(req.params.id).select(PUBLIC_PROFILE_FIELDS);
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (err) {
        console.error("Get profile error:", err.message);
        res.status(500).json({ message: "Error fetching profile." });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            "fullName",
            "bio",
            "skills",
            "department",
            "year",
            "designation",
            "currentCompany",
            "currentRole",
        ];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        console.error("Update profile error:", err.message);
        res.status(500).json({ message: "Error updating profile." });
    }
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.searchUsers = async (req, res) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 50) : "";
        if (!query) return res.json([]);

        const users = await User.find({
            _id: { $ne: req.userId },
            fullName: { $regex: escapeRegex(query), $options: "i" },
        })
            .select("fullName role department designation graduationYear currentCompany bio")
            .limit(8);

        res.json(users);
    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ message: "Error searching users." });
    }
};