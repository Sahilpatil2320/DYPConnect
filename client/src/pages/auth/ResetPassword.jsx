import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { validatePassword, validateConfirmPassword } from "../../utils/validators";
import "./AuthForm.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!done) return;
        const timer = setTimeout(() => navigate("/login"), 2500);
        return () => clearTimeout(timer);
    }, [done, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const newErrors = {
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(password, confirmPassword),
        };
        setErrors(newErrors);
        if (newErrors.password || newErrors.confirmPassword) return;

        setSubmitting(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setDone(true);
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-icon">
                    <i className="ti ti-lock" aria-hidden="true"></i>
                </div>
                <h1>Set a New Password</h1>
                <p className="auth-subtext">Choose a strong password you haven't used before.</p>

                {done ? (
                    <p className="auth-success-msg">Password updated! Taking you to the login page...</p>
                ) : (
                    <>
                        {submitError && <p className="field-error auth-submit-error">{submitError}</p>}

                        <form onSubmit={handleSubmit} className="auth-form" noValidate>
                            <label>
                                New Password
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={errors.password ? "input-error" : ""}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} aria-hidden="true"></i>
                                    </button>
                                </div>
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </label>

                            <label>
                                Confirm New Password
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={errors.confirmPassword ? "input-error" : ""}
                                />
                                {errors.confirmPassword && (
                                    <span className="field-error">{errors.confirmPassword}</span>
                                )}
                            </label>

                            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                                {submitting ? "Updating..." : "Update Password"}
                            </button>
                        </form>

                        {submitError && (
                            <p className="auth-footer-text">
                                <Link to="/forgot-password">Request a new reset link</Link>
                            </p>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default ResetPassword;