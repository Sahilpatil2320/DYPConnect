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