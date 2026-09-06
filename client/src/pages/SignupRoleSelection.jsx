import { useState } from "react";
import { Link } from "react-router-dom";
import "./SignupRoleSelection.css";

function SignupRoleSelection() {
  const [selectedRole, setSelectedRole] = useState("student");

  const roles = [
    { id: "student", icon: "🎓", title: "Student", desc: "Join as a student and connect." },
    { id: "teacher", icon: "👨‍🏫", title: "Teacher", desc: "Join as a teacher or faculty." },
    { id: "alumni", icon: "💼", title: "Alumni", desc: "Join as an alumnus and stay connected." },
  ];

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create Your Account</h1>
        <p className="auth-subtext">
          Join DYPConnect and become a part of our professional community.
        </p>

        <p className="role-label">I am a:</p>

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

        <button className="btn btn-primary auth-continue">
          Continue as {roles.find((r) => r.id === selectedRole).title}
        </button>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
}

export default SignupRoleSelection;