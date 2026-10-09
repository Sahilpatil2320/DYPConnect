import { Link } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import "./auth/AuthForm.css";
import "./NotFound.css";

function NotFound() {
    const loggedIn = !!getCurrentUser();

    return (
        <main className="auth-page">
            <div className="auth-card not-found-card">
                <div className="auth-icon">
                    <i className="ti ti-compass" aria-hidden="true"></i>
                </div>
                <h1>Page not found</h1>
                <p className="auth-subtext">
                    The page you're looking for doesn't exist or may have been moved.
                </p>

                <div className="not-found-actions">
                    {loggedIn && (
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    )}
                    <Link to="/" className={`btn ${loggedIn ? "btn-outline" : "btn-primary"}`}>
                        Go to Home Page
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default NotFound;