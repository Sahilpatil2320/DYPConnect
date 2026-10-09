const mongoose = require("mongoose");
const Opportunity = require("../models/Opportunity");
const User = require("../models/User");

const TYPES = ["internship", "job", "workshop", "event"];

const cleanText = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Returns "" if empty, null if invalid, otherwise a safe http(s) URL
function safeUrl(value) {
    const text = cleanText(value, 500);
    if (!text) return "";
    try {
        const url = new URL(text);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

exports.createOpportunity = async (req, res) => {
    try {
        const type = req.body.type;
        const title = cleanText(req.body.title, 120);
        const org = cleanText(req.body.org, 120);
        const description = cleanText(req.body.description, 2000);

        if (!TYPES.includes(type)) {
            return res.status(400).json({ message: "Please choose a valid type." });
        }
        if (!title || !org || !description) {
            return res.status(400).json({ message: "Title, organization and description are required." });
        }

        const applicationLink = safeUrl(req.body.applicationLink);
        if (applicationLink === null) {
            return res.status(400).json({ message: "The application link must start with http:// or https://" });
        }

        const opportunity = await Opportunity.create({
            postedBy: req.userId,
            type,
            title,
            org,
            description,
            location: cleanText(req.body.location, 120),
            deadline: cleanText(req.body.deadline, 60),
            applicationLink,
        });

        const populated = await opportunity.populate("postedBy", "fullName role");
        res.status(201).json(populated);
    } catch (err) {
        console.error("Create opportunity error:", err.message);
        res.status(500).json({ message: "Error creating opportunity." });
    }
};

exports.getOpportunities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);

        let query = Opportunity.find()
            .populate("postedBy", "fullName role")
            .sort({ createdAt: -1 });

        if (limit > 0) query = query.limit(Math.min(limit, 50));

        const opportunities = await query;
        res.json(opportunities);
    } catch (err) {
        console.error("Get opportunities error:", err.message);
        res.status(500).json({ message: "Error fetching opportunities." });
    }
};

exports.applyToOpportunity = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Opportunity not found." });
        }

        const opportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { applicants: req.userId } },
            { new: true }
        ).select("applicants");

        if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });

        res.json({ applicants: opportunity.applicants });
    } catch (err) {
        console.error("Apply error:", err.message);
        res.status(500).json({ message: "Error applying." });
    }
};

exports.getNewOpportunitiesCount = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const count = await Opportunity.countDocuments({
            createdAt: { $gt: user.lastVisitedOpportunities },
            postedBy: { $ne: req.userId },
        });
        res.json({ count });
    } catch (err) {
        console.error("Opportunity count error:", err.message);
        res.status(500).json({ message: "Error fetching count." });
    }
};

exports.markOpportunitiesVisited = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { lastVisitedOpportunities: new Date() });
        res.json({ message: "Marked as visited." });
    } catch (err) {
        console.error("Mark opportunities visited error:", err.message);
        res.status(500).json({ message: "Error marking visited." });
    }
};