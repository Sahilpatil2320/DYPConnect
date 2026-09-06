import "./LandingPage.css";
import campusImage from "../assets/campus.jpg";
import { Link } from "react-router-dom";

function LandingPage() {
  const features = [
    {
      icon: "👥",
      title: "Connect",
      desc: "Build meaningful connections with students, faculty and alumni.",
    },
    {
      icon: "💼",
      title: "Opportunities",
      desc: "Discover internships, jobs, events and collaborations in one place.",
    },
    {
      icon: "🏆",
      title: "Showcase",
      desc: "Share your achievements, projects and skills with the right people.",
    },
    {
      icon: "🎓",
      title: "Grow",
      desc: "Learn, get guidance and grow your professional network.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Community Members" },
    { value: "50+", label: "Departments" },
    { value: "500+", label: "Faculty Members" },
    { value: "8K+", label: "Alumni Network" },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              Connect.
              <br />
              Collaborate.
              <br />
              <span className="hero-highlight">Grow Together.</span>
            </h1>
            <p>
              DYPConnect is the official networking platform for students,
              faculty and alumni of D Y Patil College of Engineering and
              Technology, Kolhapur.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
              <button className="btn btn-outline">Explore Network</button>
            </div>
          </div>
          <div className="hero-image">
            <img src={campusImage} alt="D Y Patil College of Engineering and Technology, Kolhapur" className="hero-image-photo" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-heading">Why DYPConnect?</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;