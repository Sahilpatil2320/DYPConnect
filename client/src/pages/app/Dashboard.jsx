import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import "./Dashboard.css";

function Dashboard() {
  const currentUser = getCurrentUser();

    const roleLabels = {
        student: "Student",
        teacher: "Teacher",
        alumni: "Alumni",
    };

    const user = {
        name: currentUser.fullName,
        role: roleLabels[currentUser.role] || currentUser.role,
        department: currentUser.department || "",
        year: currentUser.year
            ? `Year ${currentUser.year}`
            : currentUser.designation || currentUser.graduationYear
                ? `Class of ${currentUser.graduationYear}`
                : "",
        connections: 128,
        profileViews: 45,
    };

    const initialPosts = [
        {
            id: 1,
            author: "Prof. Anjali Deshmukh",
            role: "Faculty, Computer Science",
            time: "2h ago",
            initials: "AD",
            content: "Excited to announce our department's AI/ML workshop next week! Open to all final-year students. Registration link in comments.",
        },
        {
            id: 2,
            author: "Rohan Shinde",
            role: "Alumni · Software Engineer at Infosys",
            time: "5h ago",
            initials: "RS",
            content: "Grateful for my time at DYPCET — it laid the foundation for everything I do now. Happy to mentor any final-year students interested in software roles!",
        },
    ];

    const [posts, setPosts] = useState(initialPosts);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const handleRefresh = () => {
            setIsRefreshing(true);
            setTimeout(() => {
                setPosts([...initialPosts].reverse());
                setIsRefreshing(false);
            }, 500);
        };

        window.addEventListener("refreshFeed", handleRefresh);
        return () => window.removeEventListener("refreshFeed", handleRefresh);
    }, []);

    const upcomingEvents = [
        { id: 1, type: "Workshop", title: "AI/ML Bootcamp", date: "Oct 4, 2026", tag: "event" },
        { id: 2, type: "Internship", title: "Frontend Dev Intern @ Zeta", date: "Apply by Oct 10", tag: "opportunity" },
        { id: 3, type: "Event", title: "Alumni Meet 2026", date: "Oct 18, 2026", tag: "event" },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-grid">
                <aside className="dashboard-left">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <h3 className="profile-name">{user.name}</h3>
                        <p className="profile-role">{user.role} · {user.department}</p>
                        <p className="profile-year">{user.year}</p>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <span className="stat-num">{user.connections}</span>
                                <span className="stat-label">Connections</span>
                            </div>
                            <div className="profile-stat">
                                <span className="stat-num">{user.profileViews}</span>
                                <span className="stat-label">Profile Views</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="dashboard-feed">
                    <div className="create-post-box">
                        <div className="post-avatar-small">
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <input
                            type="text"
                            placeholder="Share an update, achievement or opportunity..."
                            className="create-post-input"
                            readOnly
                        />
                    </div>

                    {isRefreshing && <p className="feed-refreshing">Refreshing feed...</p>}
                    <div className="feed-posts">
                        {posts.map((post) => (
                            <div className="post-card" key={post.id}>
                                <div className="post-header">
                                    <div className="post-avatar-small">{post.initials}</div>
                                    <div>
                                        <p className="post-author">{post.author}</p>
                                        <p className="post-meta">{post.role} · {post.time}</p>
                                    </div>
                                </div>
                                <p className="post-content">{post.content}</p>
                                <div className="post-actions">
                                    <button className="post-action">
                                        <i className="ti ti-thumb-up" aria-hidden="true"></i> Like
                                    </button>
                                    <button className="post-action">
                                        <i className="ti ti-message-circle" aria-hidden="true"></i> Comment
                                    </button>
                                    <button className="post-action">
                                        <i className="ti ti-share" aria-hidden="true"></i> Share
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                <aside className="dashboard-right">
                    <h4 className="sidebar-heading">Upcoming Events & Opportunities</h4>
                    <div className="event-list">
                        {upcomingEvents.map((item) => (
                            <div className="event-item" key={item.id}>
                                <span className={`event-tag event-tag-${item.tag}`}>{item.type}</span>
                                <p className="event-title">{item.title}</p>
                                <p className="event-date">{item.date}</p>
                            </div>
                        ))}
                    </div>
                    <Link to="/opportunities" className="sidebar-viewall">View all opportunities →</Link>
                </aside>
            </div>
        </div>
    );
}

export default Dashboard;