const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");

const TIME_LIMIT_SECONDS = 5 * 60;

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function pickDailyQuestion(questions, dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) % questions.length;
    }
    return questions[hash];
}

async function resetStreak(user) {
    user.currentStreak = 0;
    await user.save();
}

function ensureFreshDay(user, today) {
    if (user.questionProgressDate !== today) {
        user.questionProgressDate = today;
        user.questionElapsedSeconds = 0;
        user.questionSessionStartedAt = null;
    }
}

function getLiveElapsedSeconds(user) {
    let elapsed = user.questionElapsedSeconds;
    if (user.questionSessionStartedAt) {
        elapsed += (Date.now() - user.questionSessionStartedAt.getTime()) / 1000;
    }
    return elapsed;
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

        if (existingAnswer) {
            return res.json({
                question: {
                    _id: todaysQuestion._id,
                    questionText: todaysQuestion.questionText,
                    options: todaysQuestion.options,
                },
                alreadyAnswered: true,
                wasCorrect: existingAnswer.isCorrect,
                timedOut: existingAnswer.selectedOptionIndex === -1,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
            });
        }

        ensureFreshDay(user, today);

        if (!user.questionSessionStartedAt) {
            user.questionSessionStartedAt = new Date();
        }
        await user.save();

        const liveElapsed = getLiveElapsedSeconds(user);

        if (liveElapsed >= TIME_LIMIT_SECONDS) {
            await Answer.create({
                user: req.userId,
                question: todaysQuestion._id,
                selectedOptionIndex: -1,
                isCorrect: false,
                answeredDate: today,
            });
            user.questionElapsedSeconds = TIME_LIMIT_SECONDS;
            user.questionSessionStartedAt = null;
            await resetStreak(user);

            return res.json({
                question: {
                    _id: todaysQuestion._id,
                    questionText: todaysQuestion.questionText,
                    options: todaysQuestion.options,
                },
                alreadyAnswered: true,
                wasCorrect: false,
                timedOut: true,
                currentStreak: 0,
                longestStreak: user.longestStreak,
            });
        }

        res.json({
            question: {
                _id: todaysQuestion._id,
                questionText: todaysQuestion.questionText,
                options: todaysQuestion.options,
            },
            alreadyAnswered: false,
            elapsedSeconds: Math.floor(liveElapsed),
            timeLimit: TIME_LIMIT_SECONDS,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching today's question.", error: err.message });
    }
};

exports.pauseTimer = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const today = getTodayString();

        ensureFreshDay(user, today);

        if (user.questionSessionStartedAt) {
            const elapsedSinceSession = (Date.now() - user.questionSessionStartedAt.getTime()) / 1000;
            user.questionElapsedSeconds += elapsedSinceSession;
            user.questionSessionStartedAt = null;
            await user.save();
        }

        res.json({ message: "Timer paused." });
    } catch (err) {
        res.status(500).json({ message: "Error pausing timer.", error: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, selectedOptionIndex } = req.body;
        const today = getTodayString();
        const user = await User.findById(req.userId);

        const existing = await Answer.findOne({ user: req.userId, answeredDate: today });
        if (existing) {
            return res.status(400).json({ message: "You've already answered today's question." });
        }

        ensureFreshDay(user, today);
        const liveElapsed = getLiveElapsedSeconds(user);

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found." });

        if (liveElapsed >= TIME_LIMIT_SECONDS) {
            await Answer.create({
                user: req.userId,
                question: questionId,
                selectedOptionIndex: -1,
                isCorrect: false,
                answeredDate: today,
            });
            user.questionElapsedSeconds = TIME_LIMIT_SECONDS;
            user.questionSessionStartedAt = null;
            await resetStreak(user);

            return res.status(400).json({
                timedOut: true,
                message: "Time's up — you ran out of time for today's question.",
                currentStreak: 0,
                longestStreak: user.longestStreak,
            });
        }

        const isCorrect = question.correctOptionIndex === selectedOptionIndex;

        await Answer.create({
            user: req.userId,
            question: questionId,
            selectedOptionIndex,
            isCorrect,
            answeredDate: today,
        });

        user.questionSessionStartedAt = null;

        if (isCorrect) {
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
        } else {
            user.currentStreak = 0;
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

exports.getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("currentStreak longestStreak");
        res.json({ currentStreak: user.currentStreak, longestStreak: user.longestStreak });
    } catch (err) {
        res.status(500).json({ message: "Error fetching streak.", error: err.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { scope } = req.query;
        const user = await User.findById(req.userId);

        const filter = scope === "department" ? { department: user.department } : {};

        const leaders = await User.find({ ...filter, currentStreak: { $gt: 0 } })
            .select("fullName role department currentStreak longestStreak")
            .sort({ currentStreak: -1, longestStreak: -1 })
            .limit(20);

        res.json(leaders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching leaderboard.", error: err.message });
    }
};