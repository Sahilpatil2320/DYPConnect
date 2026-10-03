const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["internship", "job", "workshop", "event"], required: true },
        title: { type: String, required: true },
        org: { type: String, required: true },
        location: { type: String },
        description: { type: String, required: true },
        deadline: { type: String },
        applicationLink: { type: String },
        applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);