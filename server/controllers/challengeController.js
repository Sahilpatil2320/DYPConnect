const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");

const TIME_LIMIT_SECONDS = 5 * 60;
const TIMEZONE = "Asia/Kolkata";
const DAY_MS = 24 * 60 * 60 * 1000;

// Dates are calendar days in India time, written as YYYY-MM-DD
function dateString(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

function getTodayString() {
    return dateString(Date.now());
}

function getYesterdayString() {
    return dateString(Date.now() - DAY_MS);
}

function pickDailyQuestion(questions, dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) % questions.length;
    }
    return questions[hash];
}

async function getTodaysQuestionForUser(user) {
    // Sorted so the daily pick is the same for everyone in the department
    const questions = await Question.find({ department: user.department }).sort({ _id: 1 });
    if (questions.length === 0) return null;
    return pickDailyQuestion(questions, getTodayString());
}

// A streak only counts if the last correct answer was today or yesterday
function activeStreak(user) {
    if (
        user.lastAnsweredDate === getTodayString() ||
        user.lastAnsweredDate === getYesterdayString()
    ) {
        return user.currentStreak;
    }
    return 0;
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

        const todaysQuestion = await getTodaysQuestionForUser(user);
        if (!todaysQuestion) {
            return res.json({ question: null, message: "No questions available for your department yet." });
        }

        const publicQuestion = {
            _id: todaysQuestion._id,
            questionText: todaysQuestion.questionText,
            options: todaysQuestion.options,
        };

        const existingAnswer = await Answer.findOne({ user: req.userId, answeredDate: today });
        if (existingAnswer) {
            return res.json({
                question: publicQuestion,
                alreadyAnswered: true,
                wasCorrect: existingAnswer.isCorrect,
                timedOut: existingAnswer.selectedOptionIndex === -1,
                currentStreak: activeStreak(user),
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
                question: publicQuestion,
                alreadyAnswered: true,
                wasCorrect: false,
                timedOut: true,
                currentStreak: 0,
                longestStreak: user.longestStreak,
            });
        }

        res.json({
            question: publicQuestion,
            alreadyAnswered: false,
            elapsedSeconds: Math.floor(liveElapsed),
            timeLimit: TIME_LIMIT_SECONDS,
            currentStreak: activeStreak(user),
            longestStreak: user.longestStreak,
        });
    } catch (err) {
        console.error("Get today's question error:", err.message);
        res.status(500).json({ message: "Error fetching today's question." });
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
        console.error("Pause timer error:", err.message);
        res.status(500).json({ message: "Error pausing timer." });
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

        const question = await getTodaysQuestionForUser(user);
        if (!question || question._id.toString() !== String(questionId)) {
            return res.status(400).json({ message: "That isn't today's question." });
        }

        if (
            !Number.isInteger(selectedOptionIndex) ||
            selectedOptionIndex < 0 ||
            selectedOptionIndex >= question.options.length
        ) {
            return res.status(400).json({ message: "Please choose one of the options." });
        }

        ensureFreshDay(user, today);
        const liveElapsed = getLiveElapsedSeconds(user);

        if (liveElapsed >= TIME_LIMIT_SECONDS) {
            await Answer.create({
                user: req.userId,
                question: question._id,
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
            question: question._id,
            selectedOptionIndex,
            isCorrect,
            answeredDate: today,
        });

        user.questionSessionStartedAt = null;

        if (isCorrect) {
            if (user.lastAnsweredDate === getYesterdayString()) {
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
        console.error("Submit answer error:", err.message);
        res.status(500).json({ message: "Error submitting answer." });
    }
};

exports.getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select(
            "currentStreak longestStreak lastAnsweredDate"
        );
        res.json({ currentStreak: activeStreak(user), longestStreak: user.longestStreak });
    } catch (err) {
        console.error("Get streak error:", err.message);
        res.status(500).json({ message: "Error fetching streak." });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { scope } = req.query;
        const user = await User.findById(req.userId);

        const filter = scope === "department" ? { department: user.department } : {};

        const leaders = await User.find({
            ...filter,
            currentStreak: { $gt: 0 },
            lastAnsweredDate: { $in: [getTodayString(), getYesterdayString()] },
        })
            .select("fullName role department currentStreak longestStreak")
            .sort({ currentStreak: -1, longestStreak: -1 })
            .limit(20);

        res.json(leaders);
    } catch (err) {
        console.error("Leaderboard error:", err.message);
        res.status(500).json({ message: "Error fetching leaderboard." });
    }
};