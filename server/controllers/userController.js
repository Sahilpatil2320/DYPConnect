const User = require("../models/User");
const Connection = require("../models/Connection");

exports.getSuggestions = async (req, res) => {
    try {
        const existingConnections = await Connection.find({
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
        res.status(500).json({ message: "Error fetching suggestions.", error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile.", error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = ["fullName", "bio", "skills", "department", "year", "designation", "currentCompany", "currentRole"];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error updating profile.", error: err.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q || "";
        if (!query.trim()) return res.json([]);

        const users = await User.find({
            _id: { $ne: req.userId },
            fullName: { $regex: query, $options: "i" },
        })
            .select("fullName role department designation graduationYear currentCompany bio")
            .limit(8);

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error searching users.", error: err.message });
    }
};