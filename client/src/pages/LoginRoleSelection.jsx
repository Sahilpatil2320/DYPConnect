import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignupRoleSelection.css";

function LoginRoleSelection() {
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();

  const roles = [
    { id: "student", icon: "🎓", title: "Student", desc: "Login as a student account." },
    { id: "teacher", icon: "👨‍🏫", title: "Teacher", desc: "Login as a teacher or faculty." },
    { id: "alumni", icon: "💼", title: "Alumni", desc: "Login as an alumni account." },
  ];

  return (
    <main className="auth-page">
      <div className="role-select-card">
        <h1>Welcome Back!</h1>
        <p className="auth-subtext">Login to your DYPConnect account</p>

        <p className="role-label">Login as:</p>

        <div className="role-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`role-card ${selectedRole === role.id ? "role-card-active" : ""}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-title">{role.title}</span>
              <span className="role-desc">{role.desc}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary auth-continue"
          onClick={() => navigate(`/login/${selectedRole}`)}
        >
          Continue as {roles.find((r) => r.id === selectedRole).title}
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}

export default LoginRoleSelection;