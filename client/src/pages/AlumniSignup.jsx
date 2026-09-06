import { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

function AlumniSignup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    graduationYear: "",
    currentCompany: "",
    currentRole: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Alumni signup data:", formData);
    // Backend connection comes in Phase 3 (Authentication)
  };

  const graduationYears = Array.from({ length: 30 }, (_, i) => 2026 - i);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/signup" className="auth-back">← Back</Link>

        <div className="auth-icon">💼</div>
        <h1>Alumni Sign Up</h1>
        <p className="auth-subtext">Create your alumni account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

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
                placeholder="Create a password"
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

          <label>
            Confirm Password
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Department
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select your department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">Electronics</option>
            </select>
          </label>

          <label>
            Graduation Year
            <select
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              required
            >
              <option value="">Select graduation year</option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label>
            Current Company
            <input
              type="text"
              name="currentCompany"
              placeholder="Enter your current company"
              value={formData.currentCompany}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Current Role
            <input
              type="text"
              name="currentRole"
              placeholder="Enter your current job title"
              value={formData.currentRole}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary auth-submit">
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}

export default AlumniSignup;