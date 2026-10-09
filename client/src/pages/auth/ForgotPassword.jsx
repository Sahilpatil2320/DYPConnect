import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { validateEmail } from "../../utils/validators";
import "./AuthForm.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateEmail(email);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setSubmitting(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <Link to="/login" className="auth-back">← Back to Login</Link>

                <div className="auth-icon">
                    <i className={`ti ${sent ? "ti-mail" : "ti-lock"}`} aria-hidden="true"></i>
                </div>

                {!sent ? (
                    <>
                        <h1>Reset Your Password</h1>
                        <p className="auth-subtext">
                            Enter the email you signed up with and we'll send you a link to set a new password.
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form" noValidate>
                            <label>
                                Email Address
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={error ? "input-error" : ""}
                                />
                                {error && <span className="field-error">{error}</span>}
                            </label>

                            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                                {submitting ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1>Check Your Email</h1>
                        <p className="auth-success-msg">
                            If an account exists for {email}, we've sent a password reset link. It expires in 1 hour.
                        </p>

                        {import.meta.env.DEV && (
                            <p className="auth-note">
                                Development mode: no email service is set up yet, so the reset link was printed in
                                the server terminal instead of being emailed.
                            </p>
                        )}

                        <button className="btn btn-outline auth-submit" onClick={() => setSent(false)}>
                            Use a different email
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}

export default ForgotPassword;