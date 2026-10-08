import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { scrollToSection } from "../utils/scroll";
import { useLandingNav } from "../utils/useLandingNav";
import "./LandingPage.css";

function LandingPage() {
    const location = useLocation();
    const { goToSection } = useLandingNav();
    const [openFaq, setOpenFaq] = useState(null);

    // Handles arriving from another page (e.g. clicking "About" on the Login page)
    useEffect(() => {
        const target = location.state?.scrollTo;
        if (target && target !== "home") {
            const timer = setTimeout(() => scrollToSection(target), 150);
            return () => clearTimeout(timer);
        }
        window.scrollTo(0, 0);
    }, [location.key]);

    const aboutPoints = [
        {
            icon: "ti-building-community",
            title: "Built for one college",
            desc: "Unlike big networks, everyone here belongs to D Y Patil College of Engineering and Technology, Kolhapur.",
        },
        {
            icon: "ti-users-group",
            title: "Three communities, one place",
            desc: "Students, teachers and alumni each get a role-based account and can all connect with each other.",
        },
        {
            icon: "ti-target-arrow",
            title: "Made for growth",
            desc: "Showcase your skills, find opportunities and learn something new every day.",
        },
    ];

    const features = [
        { icon: "ti-id-badge-2", title: "Professional Profiles", desc: "Showcase your bio, skills and department on a profile built for your college." },
        { icon: "ti-news", title: "Posts & Feed", desc: "Share updates and achievements, and like or comment on what your network posts." },
        { icon: "ti-users", title: "Smart Connections", desc: "Send and accept connection requests and discover people you may know." },
        { icon: "ti-message-circle", title: "Real-time Chat", desc: "Message your connections instantly, with live typing indicators." },
        { icon: "ti-bell", title: "Instant Notifications", desc: "Get notified about likes, comments, connection requests and new messages." },
        { icon: "ti-briefcase", title: "Opportunities", desc: "Find internships, jobs, workshops and events shared by faculty and alumni." },
        { icon: "ti-flame", title: "Daily Challenge", desc: "Answer one question from your department every day, build a streak and climb the leaderboard." },
        { icon: "ti-search", title: "People Search", desc: "Find students, teachers and alumni as you type, with your recent searches saved." },
    ];

    const steps = [
        { icon: "ti-user-plus", title: "Create your account", desc: "Sign up as a Student, Teacher or Alumni with details that fit your role." },
        { icon: "ti-users", title: "Build your profile & network", desc: "Add your bio and skills, then connect with classmates, faculty and alumni." },
        { icon: "ti-rocket", title: "Share, chat and grow", desc: "Post updates, message connections, apply to opportunities and keep your streak alive." },
    ];

    const roles = [
        {
            icon: "ti-school",
            title: "Students",
            points: [
                "Connect with seniors and faculty",
                "Showcase skills and achievements",
                "Discover internships and events",
                "Build a daily learning streak",
            ],
        },
        {
            icon: "ti-presentation",
            title: "Teachers",
            points: [
                "Share workshops and announcements",
                "Mentor and guide students",
                "Post opportunities for your department",
                "Stay connected with alumni",
            ],
        },
        {
            icon: "ti-briefcase",
            title: "Alumni",
            points: [
                "Reconnect with your college",
                "Mentor current students",
                "Share jobs and internships",
                "Give back to your department",
            ],
        },
    ];

    const stats = [
        { value: "10K+", label: "Community Members" },
        { value: "50+", label: "Departments" },
        { value: "500+", label: "Faculty Members" },
        { value: "8K+", label: "Alumni Network" },
    ];

    const faqs = [
        {
            q: "Who can use DYPConnect?",
            a: "DYPConnect is built for students, teachers and alumni of D Y Patil College of Engineering and Technology, Kolhapur. You choose your role when you sign up.",
        },
        {
            q: "Is DYPConnect free to use?",
            a: "Yes, DYPConnect is completely free to use.",
        },
        {
            q: "How do I connect with someone?",
            a: "Open My Network, find people under People You May Know (or use the search bar) and click Connect. Once they accept, you can message each other.",
        },
        {
            q: "How does the Daily Challenge work?",
            a: "Every day you get one question based on your department and have 5 minutes to answer. A correct answer keeps your streak going, while a wrong answer or running out of time resets it. Your timer pauses if you leave the page.",
        },
        {
            q: "Can I use dark mode?",
            a: "Yes. Use the moon icon in the top bar, or the Dark Mode option in your profile menu after you log in. Your choice is remembered.",
        },
    ];

    const contactCards = [
        { icon: "ti-map-pin", title: "Visit us", text: "D Y Patil College of Engineering and Technology, Kasaba Bawada, Kolhapur" },
        { icon: "ti-mail", title: "Email us", text: "connect@dypatil.edu" },
        { icon: "ti-phone", title: "Call us", text: "+91 1234567890" },
    ];

    return (
        <main>
            {/* Hero */}
            <section className="hero" id="home">
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
                            <button className="btn btn-outline" onClick={() => goToSection("network")}>
                                Explore Network
                            </button>
                        </div>
                    </div>

                    <div className="hero-image">
                        {/* If you added your campus photo earlier, put your <img> back here:
                <img src={campusImage} alt="Campus" className="hero-image-photo" /> */}
                        <div className="hero-image-placeholder">D Y PATIL COLLEGE, KOLHAPUR</div>
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="section" id="about">
                <div className="container">
                    <h2 className="section-heading">About DYPConnect</h2>
                    <p className="section-subheading">
                        DYPConnect is a professional networking platform designed only for our
                        college community. It helps students build a professional identity while
                        still in college, and keeps faculty and alumni connected to the people
                        they've taught and the place they've grown.
                    </p>
                    <div className="about-grid">
                        {aboutPoints.map((p) => (
                            <div className="about-card" key={p.title}>
                                <div className="about-icon">
                                    <i className={`ti ${p.icon}`} aria-hidden="true"></i>
                                </div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section section-alt" id="features">
                <div className="container">
                    <h2 className="section-heading">Everything you need in one place</h2>
                    <p className="section-subheading">
                        From your first post to your daily streak, DYPConnect brings your
                        college community together.
                    </p>
                    <div className="features-grid">
                        {features.map((f) => (
                            <div className="feature-card" key={f.title}>
                                <div className="feature-icon">
                                    <i className={`ti ${f.icon}`} aria-hidden="true"></i>
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section">
                <div className="container">
                    <h2 className="section-heading">How it works</h2>
                    <p className="section-subheading">Get started in three simple steps.</p>
                    <div className="steps-grid">
                        {steps.map((s, i) => (
                            <div className="step-card" key={s.title}>
                                <div className="step-number">{i + 1}</div>
                                <div className="step-icon">
                                    <i className={`ti ${s.icon}`} aria-hidden="true"></i>
                                </div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who it's for */}
            <section className="section section-alt">
                <div className="container">
                    <h2 className="section-heading">Who is it for?</h2>
                    <p className="section-subheading">
                        Whether you're studying, teaching or have already graduated, there's a place for you.
                    </p>
                    <div className="roles-grid">
                        {roles.map((r) => (
                            <div className="role-info-card" key={r.title}>
                                <div className="feature-icon">
                                    <i className={`ti ${r.icon}`} aria-hidden="true"></i>
                                </div>
                                <h3>{r.title}</h3>
                                <ul>
                                    {r.points.map((pt) => (
                                        <li key={pt}>{pt}</li>
                                    ))}
                                </ul>
                                <Link to="/signup" className="btn btn-outline role-info-btn">
                                    Join as {r.title.slice(0, -1)}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Network / Stats */}
            <section className="stats" id="network">
                <div className="container">
                    <h2 className="section-heading">Our college network</h2>
                    <p className="section-subheading">
                        One community of students, faculty and alumni, all in the same place.
                    </p>
                    <div className="stats-grid">
                        {stats.map((s) => (
                            <div className="stat-item" key={s.label}>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section">
                <div className="container">
                    <h2 className="section-heading">Frequently asked questions</h2>
                    <p className="section-subheading">Quick answers to common questions.</p>
                    <div className="faq-list">
                        {faqs.map((f, i) => (
                            <div className="faq-item" key={f.q}>
                                <button
                                    className="faq-question"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    aria-expanded={openFaq === i}
                                >
                                    {f.q}
                                    <i className={`ti ${openFaq === i ? "ti-minus" : "ti-plus"}`} aria-hidden="true"></i>
                                </button>
                                {openFaq === i && <p className="faq-answer">{f.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="cta-band">
                <div className="container cta-inner">
                    <h2>Ready to join your college network?</h2>
                    <p>Create your account in under a minute and start connecting.</p>
                    <div className="cta-actions">
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        <Link to="/login" className="btn btn-outline">Log In</Link>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="section section-alt" id="contact">
                <div className="container">
                    <h2 className="section-heading">Contact us</h2>
                    <p className="section-subheading">Questions or feedback? We'd love to hear from you.</p>
                    <div className="contact-grid">
                        {contactCards.map((c) => (
                            <div className="contact-card" key={c.title}>
                                <div className="about-icon">
                                    <i className={`ti ${c.icon}`} aria-hidden="true"></i>
                                </div>
                                <h3>{c.title}</h3>
                                <p>{c.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default LandingPage;