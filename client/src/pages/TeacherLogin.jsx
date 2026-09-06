import { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

function TeacherLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Teacher login data:", formData);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back">← Back</Link>

        <div className="auth-icon">👨‍🏫</div>
        <h1>Teacher Login</h1>
        <p className="auth-subtext">Welcome back! Please login to continue.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
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
                required
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