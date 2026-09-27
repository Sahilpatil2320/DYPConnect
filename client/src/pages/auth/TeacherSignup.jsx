import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword, validateConfirmPassword, validateRequired } from "../../utils/validators";
import { registerUser } from "../../utils/fakeAuth";
import "./AuthForm.css";

function TeacherSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {
      fullName: validateRequired(formData.fullName, "Full name"),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      department: validateRequired(formData.department, "Department"),
      designation: validateRequired(formData.designation, "Designation"),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = registerUser("teacher", formData);
    if (!result.success) {
      setSubmitError(result.message);
      return;
    }

    navigate("/login/teacher");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/signup" className="auth-back">← Back</Link>

        <div className="auth-icon">👨‍🏫</div>
        <h1>Teacher Sign Up</h1>
        <p className="auth-subtext">Create your faculty account</p>

        {submitError && <p className="field-error auth-submit-error">{submitError}</p>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </label>

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
                placeholder="Create a password"
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

          <label>
            Confirm Password
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </label>

          <label>
            Department
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? "input-error" : ""}
            >
              <option value="">Select your department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">Electronics</option>
            </select>
            {errors.department && <span className="field-error">{errors.department}</span>}
          </label>

          <label>
            Designation
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={errors.designation ? "input-error" : ""}
            >
              <option value="">Select your designation</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
              <option value="HOD">Head of Department</option>
            </select>
            {errors.designation && <span className="field-error">{errors.designation}</span>}
          </label>

          <button type="submit" className="btn btn-primary auth-submit">
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}

export default TeacherSignup;