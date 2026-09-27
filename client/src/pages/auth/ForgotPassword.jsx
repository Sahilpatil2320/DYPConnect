import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkEmailExists, resetPassword } from "../../utils/fakeAuth";
import { validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validators";
import "./AuthForm.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    if (!checkEmailExists(email)) {
      setEmailError("No account found with this email.");
      return;
    }

    setEmailError("");
    setStep(2);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };
    setPasswordErrors(errors);
    if (errors.newPassword || errors.confirmPassword) return;

    const result = resetPassword(email, newPassword);
    if (!result.success) {
      setPasswordErrors({ newPassword: result.message });
      return;
    }

    setSuccessMessage("Password reset successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back">← Back to Login</Link>

        <div className="auth-icon">🔒</div>
        <h1>{step === 1 ? "Reset Your Password" : "Set New Password"}</h1>
        <p className="auth-subtext">
          {step === 1
            ? "Enter the email associated with your account."
            : `Setting a new password for ${email}`}
        </p>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form" noValidate>
            <p className="auth-note">
              Note: since DYPConnect doesn't have email sending set up yet, you'll set your new password directly here instead of via an emailed link.
            </p>

            <label>
              Email Address
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "input-error" : ""}
              />
              {emailError && <span className="field-error">{emailError}</span>}
            </label>

            <button type="submit" className="btn btn-primary auth-submit">
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="auth-form" noValidate>
            {successMessage && <p className="field-error auth-success-msg">{successMessage}</p>}

            <label>
              New Password
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={passwordErrors.newPassword ? "input-error" : ""}
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
              {passwordErrors.newPassword && (
                <span className="field-error">{passwordErrors.newPassword}</span>
              )}
            </label>

            <label>
              Confirm New Password
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={passwordErrors.confirmPassword ? "input-error" : ""}
              />
              {passwordErrors.confirmPassword && (
                <span className="field-error">{passwordErrors.confirmPassword}</span>
              )}
            </label>

            <button type="submit" className="btn btn-primary auth-submit" disabled={!!successMessage}>
              Reset Password
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default ForgotPassword;