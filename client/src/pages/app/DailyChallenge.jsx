import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import "./DailyChallenge.css";

function DailyChallenge() {
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [alreadyAnswered, setAlreadyAnswered] = useState(false);
    const [wasCorrect, setWasCorrect] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [noQuestions, setNoQuestions] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(null);
    const timerRef = useRef(null);
    const TIME_LIMIT_SECONDS = 5 * 60;

    const fetchToday = async () => {
        setLoading(true);
        try {
            const res = await api.get("/challenge/today");
            if (!res.data.question) {
                setNoQuestions(true);
            } else {
                setQuestion(res.data.question);
                setAlreadyAnswered(res.data.alreadyAnswered);
                setWasCorrect(res.data.wasCorrect);
                setTimedOut(res.data.timedOut || false);
                setCurrentStreak(res.data.currentStreak);
                setLongestStreak(res.data.longestStreak);
                if (!res.data.alreadyAnswered) {
                    setElapsedSeconds(res.data.elapsedSeconds);
                }
            }
        } catch (err) {
            console.error("Failed to load today's question:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToday();

        return () => {
            api.post("/challenge/pause").catch((err) => {
                console.error("Failed to pause timer:", err);
            });
        };
    }, []);

    useEffect(() => {
        if (elapsedSeconds === null || alreadyAnswered || result) return;

        if (elapsedSeconds >= TIME_LIMIT_SECONDS) {
            handleTimeout();
            return;
        }

        timerRef.current = setTimeout(() => {
            setElapsedSeconds((s) => s + 1);
        }, 1000);

        return () => clearTimeout(timerRef.current);
    }, [elapsedSeconds, alreadyAnswered, result]);

    const handleTimeout = async () => {
        setSubmitting(true);
        try {
            await fetchToday();
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null) return;
        setSubmitting(true);
        try {
            const res = await api.post("/challenge/answer", {
                questionId: question._id,
                selectedOptionIndex: selectedOption,
            });
            setResult(res.data);
            setCurrentStreak(res.data.currentStreak);
            setLongestStreak(res.data.longestStreak);
            setAlreadyAnswered(true);
        } catch (err) {
            if (err.response?.data?.timedOut) {
                setTimedOut(true);
                setAlreadyAnswered(true);
                setCurrentStreak(0);
            } else {
                console.error("Failed to submit answer:", err);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const isLowTime = elapsedSeconds !== null && elapsedSeconds >= TIME_LIMIT_SECONDS - 60;

    if (loading) {
        return (
            <div className="daily-challenge-page">
                <p className="notifications-empty">Loading today's challenge...</p>
            </div>
        );
    }

    if (noQuestions) {
        return (
            <div className="daily-challenge-page">
                <div className="daily-challenge-card">
                    <div className="daily-challenge-icon">🔥</div>
                    <h1>Daily Challenge</h1>
                    <p className="daily-challenge-subtext">
                        No questions available for your department yet. Check back soon!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="daily-challenge-page">
            <div className="daily-challenge-card">
                <div className="streak-row">
                    <div className="streak-stat">
                        <span className="streak-num">🔥 {currentStreak}</span>
                        <span className="streak-label">Current Streak</span>
                    </div>
                    <div className="streak-stat">
                        <span className="streak-num">🏆 {longestStreak}</span>
                        <span className="streak-label">Longest Streak</span>
                    </div>
                </div>

                <div className="daily-challenge-header">
                    <h1>Question of the Day</h1>
                    {!alreadyAnswered && !result && elapsedSeconds !== null && (
                        <div className={`daily-timer ${isLowTime ? "daily-timer-low" : ""}`}>
                            <i className="ti ti-clock" aria-hidden="true"></i>
                            {formatTime(elapsedSeconds)} / 5:00
                        </div>
                    )}
                </div>

                <p className="daily-challenge-question">{question.questionText}</p>

                <div className="daily-challenge-options">
                    {question.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectAnswer = result && idx === result.correctOptionIndex;
                        const isWrongSelected = result && isSelected && !result.isCorrect;

                        let optionClass = "daily-option";
                        if (result) {
                            if (isCorrectAnswer) optionClass += " daily-option-correct";
                            else if (isWrongSelected) optionClass += " daily-option-wrong";
                        } else if (isSelected) {
                            optionClass += " daily-option-selected";
                        }

                        return (
                            <button
                                key={idx}
                                className={optionClass}
                                onClick={() => !alreadyAnswered && !result && setSelectedOption(idx)}
                                disabled={alreadyAnswered || !!result || timedOut}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {!alreadyAnswered && !result && !timedOut && (
                    <button
                        className="btn btn-primary daily-submit-btn"
                        onClick={handleSubmit}
                        disabled={selectedOption === null || submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Answer"}
                    </button>
                )}

                {result && (
                    <div className={`daily-result ${result.isCorrect ? "daily-result-correct" : "daily-result-wrong"}`}>
                        <p className="daily-result-headline">
                            {result.isCorrect ? "Correct! Streak continues! 🎉" : "Not quite — your streak has reset."}
                        </p>
                        {result.explanation && <p className="daily-result-explanation">{result.explanation}</p>}
                    </div>
                )}

                {timedOut && !result && (
                    <div className="daily-result daily-result-wrong">
                        <p className="daily-result-headline">
                            Time's up! You didn't answer within 5 minutes — your streak has reset.
                        </p>
                        <p className="daily-result-explanation">Come back tomorrow for a new question.</p>
                    </div>
                )}

                {alreadyAnswered && !result && !timedOut && (
                    <div className={`daily-result ${wasCorrect ? "daily-result-correct" : "daily-result-wrong"}`}>
                        <p className="daily-result-headline">
                            You already answered today's question — {wasCorrect ? "and got it right! 🎉" : "better luck tomorrow."}
                        </p>
                    </div>
                )}

                <Link to="/leaderboard" className="daily-leaderboard-link">
                    <i className="ti ti-trophy" aria-hidden="true"></i>
                    View Leaderboard
                </Link>
            </div>
        </div>
    );
}

export default DailyChallenge;