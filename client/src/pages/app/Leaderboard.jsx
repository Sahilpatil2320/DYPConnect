import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import { getInitials } from "../../utils/getInitials";
import "./Leaderboard.css";

function Leaderboard() {
    const currentUser = getCurrentUser();
    const [scope, setScope] = useState("department");
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async (selectedScope) => {
        setLoading(true);
        try {
            const res = await api.get(`/challenge/leaderboard?scope=${selectedScope}`);
            setLeaders(res.data);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard(scope);
    }, [scope]);

    const rankBadge = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`;
    };

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-container">
                <Link to="/daily-challenge" className="auth-back">← Back to Daily Challenge</Link>

                <div className="leaderboard-header">
                    <h1><i className="ti ti-flame leaderboard-flame" aria-hidden="true"></i> Streak Leaderboard</h1>
                    <p className="leaderboard-subtext">
                        Top streaks from {scope === "department" ? `the ${currentUser.department || "your"} department` : "across the college"}
                    </p>
                </div>

                <div className="leaderboard-scope-toggle">
                    <button
                        className={`scope-btn ${scope === "department" ? "scope-btn-active" : ""}`}
                        onClick={() => setScope("department")}
                    >
                        My Department
                    </button>
                    <button
                        className={`scope-btn ${scope === "college" ? "scope-btn-active" : ""}`}
                        onClick={() => setScope("college")}
                    >
                        Whole College
                    </button>
                </div>

                {loading && <p className="notifications-empty">Loading leaderboard...</p>}

                {!loading && leaders.length === 0 && (
                    <p className="notifications-empty">
                        No active streaks yet — be the first to start one!
                    </p>
                )}

                {!loading && leaders.length > 0 && (
                    <div className="leaderboard-list">
                        {leaders.map((leader, index) => {
                            const isMe = leader._id === currentUser._id;
                            return (
                                <div
                                    key={leader._id}
                                    className={`leaderboard-item ${isMe ? "leaderboard-item-me" : ""} ${index < 3 ? "leaderboard-item-top" : ""}`}
                                >
                                    <span className="leaderboard-rank">{rankBadge(index)}</span>
                                    <div className="post-avatar-small">{getInitials(leader.fullName)}</div>
                                    <div className="leaderboard-info">
                                        <p className="leaderboard-name">
                                            {leader.fullName} {isMe && <span className="leaderboard-you-tag">You</span>}
                                        </p>
                                        <p className="leaderboard-dept">{leader.department}</p>
                                    </div>
                                    <div className="leaderboard-streak">
                                        <span className="leaderboard-streak-num"><i className="ti ti-flame leaderboard-flame" aria-hidden="true"></i> {leader.currentStreak}</span>
                                        <span className="leaderboard-streak-label">day streak</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;