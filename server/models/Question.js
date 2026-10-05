const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        department: { type: String, required: true },
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        explanation: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);