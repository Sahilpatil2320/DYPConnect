import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { validateEmail } from "../../utils/validators";
import "./AuthForm.css";

const RESEND_SECONDS = 30;

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [resendMessage, setResendMessage] = useState("");

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const requestLink = () => api.post("/auth/forgot-password", { email: email.trim() });

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
            await requestLink();
            setSent(true);
            setCooldown(RESEND_SECONDS);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setResendMessage("");
        setSubmitting(true);
        try {
            await requestLink();
            setCooldown(RESEND_SECONDS);
            setResendMessage("A new link has been sent.");
        } catch (err) {
            setResendMessage(err.response?.data?.message || "Couldn't resend. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUseDifferentEmail = () => {
        setSent(false);
        setResendMessage("");
        setError("");
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

                        {error && <p className="field-error auth-submit-error">{error}</p>}

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
                            We've sent a password reset link to <strong>{email.trim()}</strong>. It expires in 1 hour.
                        </p>
                        <p className="auth-note">
                            Can't see it? Check your spam or promotions folder.
                        </p>
                        {resendMessage && <p className="auth-note">{resendMessage}</p>}

                        <button
                            className="btn btn-primary auth-submit"
                            onClick={handleResend}
                            disabled={submitting || cooldown > 0}
                        >
                            {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
                        </button>
                        <button className="btn btn-outline auth-submit" onClick={handleUseDifferentEmail}>
                            Use a different email
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}

export default ForgotPassword;