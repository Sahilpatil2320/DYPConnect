const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function pickDailyQuestion(questions, dateStr) {
    // Deterministic "random" pick based on date, so everyone in a department gets the same question that day
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) % questions.length;
    }
    return questions[hash];
}

exports.getTodayQuestion = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const today = getTodayString();

        const existingAnswer = await Answer.findOne({ user: req.userId, answeredDate: today });

        const questions = await Question.find({ department: user.department });
        if (questions.length === 0) {
            return res.json({ question: null, message: "No questions available for your department yet." });
        }

        const todaysQuestion = pickDailyQuestion(questions, today);

        res.json({
            question: {
                _id: todaysQuestion._id,
                questionText: todaysQuestion.questionText,
                options: todaysQuestion.options,
            },
            alreadyAnswered: !!existingAnswer,
            wasCorrect: existingAnswer ? existingAnswer.isCorrect : null,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching today's question.", error: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, selectedOptionIndex } = req.body;
        const today = getTodayString();

        const existing = await Answer.findOne({ user: req.userId, answeredDate: today });
        if (existing) {
            return res.status(400).json({ message: "You've already answered today's question." });
        }

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found." });

        const isCorrect = question.correctOptionIndex === selectedOptionIndex;

        await Answer.create({
            user: req.userId,
            question: questionId,
            selectedOptionIndex,
            isCorrect,
            answeredDate: today,
        });

        const user = await User.findById(req.userId);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (user.lastAnsweredDate === yesterdayStr) {
            user.currentStreak += 1;
        } else {
            user.currentStreak = 1;
        }
        user.lastAnsweredDate = today;
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
        await user.save();

        res.json({
            isCorrect,
            correctOptionIndex: question.correctOptionIndex,
            explanation: question.explanation,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
        });
    } catch (err) {
        res.status(500).json({ message: "Error submitting answer.", error: err.message });
    }
};