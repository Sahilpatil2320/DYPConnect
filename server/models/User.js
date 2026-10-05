const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["student", "teacher", "alumni"], required: true },
        department: { type: String },
        year: { type: String },
        designation: { type: String },
        graduationYear: { type: String },
        currentCompany: { type: String },
        currentRole: { type: String },
        bio: { type: String, default: "" },
        skills: [{ type: String }],
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastAnsweredDate: { type: String }, // stored as "YYYY-MM-DD"
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);