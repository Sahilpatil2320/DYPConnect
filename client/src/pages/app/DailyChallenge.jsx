import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import "./DailyChallenge.css";

const TIME_LIMIT_SECONDS = 5 * 60;

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
    const [syncKey, setSyncKey] = useState(0);
    const timerRef = useRef(null);

    // silent = refresh in the background without showing the loading screen
    const fetchToday = async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
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
                setSyncKey((k) => k + 1);
            }
        } catch (err) {
            console.error("Failed to load today's question:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Load on open. Pause the server clock when leaving this page inside the app.
    useEffect(() => {
        fetchToday();

        return () => {
            api.post("/challenge/pause").catch((err) => {
                console.error("Failed to pause timer:", err);
            });
        };
    }, []);

    // Pause when the tab is hidden or closed, and resume when it comes back.
    useEffect(() => {
        const baseUrl = api.defaults.baseURL;

        const pauseOnServer = () => {
            const token = localStorage.getItem("dypconnect_token");
            if (!token) return;
            // keepalive lets this request finish even while the tab is closing
            fetch(`${baseUrl}/challenge/pause`, {
                method: "POST",
                keepalive: true,
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => { });
        };

        const handleVisibility = () => {
            if (document.visibilityState === "hidden") {
                pauseOnServer();
            } else {
                fetchToday({ silent: true });
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("pagehide", pauseOnServer);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("pagehide", pauseOnServer);
        };
    }, []);

    // The visible clock. It stands still while the tab is hidden.
    useEffect(() => {
        if (elapsedSeconds === null || alreadyAnswered || result) return;
        if (document.visibilityState === "hidden") return;

        if (elapsedSeconds >= TIME_LIMIT_SECONDS) {
            fetchToday({ silent: true });
            return;
        }

        timerRef.current = setTimeout(() => {
            setElapsedSeconds((s) => s + 1);
        }, 1000);

        return () => clearTimeout(timerRef.current);
    }, [elapsedSeconds, alreadyAnswered, result, syncKey]);

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