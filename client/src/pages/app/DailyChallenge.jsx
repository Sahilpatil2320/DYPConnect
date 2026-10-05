import "./DailyChallenge.css";

function DailyChallenge() {
    return (
        <div className="daily-challenge-page">
            <div className="daily-challenge-card">
                <div className="daily-challenge-icon">🔥</div>
                <h1>Daily Challenge</h1>
                <p className="daily-challenge-subtext">
                    Question of the Day — department-specific engineering questions to keep your streak alive.
                </p>
                <p className="daily-challenge-coming-soon">Coming soon</p>
            </div>
        </div>
    );
}

export default DailyChallenge;