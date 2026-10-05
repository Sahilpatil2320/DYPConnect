const Opportunity = require("../models/Opportunity");

exports.createOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.create({
            ...req.body,
            postedBy: req.userId,
        });
        const populated = await opportunity.populate("postedBy", "fullName role");
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: "Error creating opportunity.", error: err.message });
    }
};

exports.getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find()
            .populate("postedBy", "fullName role")
            .sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (err) {
        res.status(500).json({ message: "Error fetching opportunities.", error: err.message });
    }
};

exports.applyToOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });

        const alreadyApplied = opportunity.applicants.includes(req.userId);
        if (alreadyApplied) {
            return res.status(400).json({ message: "You've already applied to this." });
        }

        opportunity.applicants.push(req.userId);
        await opportunity.save();

        res.json({ applicants: opportunity.applicants });
    } catch (err) {
        res.status(500).json({ message: "Error applying.", error: err.message });
    }
};

const User = require("../models/User");

exports.getNewOpportunitiesCount = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const count = await Opportunity.countDocuments({
            createdAt: { $gt: user.lastVisitedOpportunities },
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching count.", error: err.message });
    }
};

exports.markOpportunitiesVisited = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { lastVisitedOpportunities: new Date() });
        res.json({ message: "Marked as visited." });
    } catch (err) {
        res.status(500).json({ message: "Error marking visited.", error: err.message });
    }
};