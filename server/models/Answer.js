const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        answeredDate: { type: String, required: true }, // "YYYY-MM-DD"
    },
    { timestamps: true }
);

answerSchema.index({ user: 1, answeredDate: 1 }, { unique: true });

module.exports = mongoose.model("Answer", answerSchema);