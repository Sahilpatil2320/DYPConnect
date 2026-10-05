import { useState, useEffect } from "react";
import api from "../../utils/api";
import "./DailyChallenge.css";

function DailyChallenge() {
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [alreadyAnswered, setAlreadyAnswered] = useState(false);
    const [wasCorrect, setWasCorrect] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [noQuestions, setNoQuestions] = useState(false);

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
                setCurrentStreak(res.data.currentStreak);
                setLongestStreak(res.data.longestStreak);
            }
        } catch (err) {
            console.error("Failed to load today's question:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToday();
    }, []);

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
            console.error("Failed to submit answer:", err);
        } finally {
            setSubmitting(false);
        }
    };

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

                <h1>Question of the Day</h1>

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
                                disabled={alreadyAnswered || !!result}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {!alreadyAnswered && !result && (
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
                            {result.isCorrect ? "Correct! 🎉" : "Not quite — see the explanation below."}
                        </p>
                        {result.explanation && <p className="daily-result-explanation">{result.explanation}</p>}
                    </div>
                )}

                {alreadyAnswered && !result && (
                    <div className={`daily-result ${wasCorrect ? "daily-result-correct" : "daily-result-wrong"}`}>
                        <p className="daily-result-headline">
                            You already answered today's question — {wasCorrect ? "and got it right! 🎉" : "come back tomorrow for a new one."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DailyChallenge;