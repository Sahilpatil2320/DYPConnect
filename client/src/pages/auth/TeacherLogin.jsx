import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../utils/fakeAuth";
import { validateEmail, validateRequired } from "../../utils/validators";
import "./AuthForm.css";

function TeacherLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validateRequired(formData.password, "Password"),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const result = loginUser("teacher", formData.email, formData.password);
    if (!result.success) {
      setSubmitError(result.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back">← Back</Link>

        <div className="auth-icon">👨‍🏫</div>
        <h1>Teacher Login</h1>
        <p className="auth-subtext">Welcome back! Please login to continue.</p>

        {submitError && <p className="field-error auth-submit-error">{submitError}</p>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label>
            Password
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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

          <p className="auth-forgot">
            <Link to="#">Forgot Password?</Link>
          </p>

          <button type="submit" className="btn btn-primary auth-submit">
            Log In
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="btn btn-outline auth-google">
          <i className="ti ti-brand-google" aria-hidden="true"></i>
          Login with Google
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}

export default TeacherLogin;