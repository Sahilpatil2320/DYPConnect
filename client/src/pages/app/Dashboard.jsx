import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";
import "./Dashboard.css";

function Dashboard() {
    const currentUser = getCurrentUser();

    const roleLabels = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

    const user = {
        name: currentUser.fullName,
        role: roleLabels[currentUser.role] || currentUser.role,
        department: currentUser.department || "",
        year: currentUser.year
            ? `Year ${currentUser.year}`
            : currentUser.designation
                ? currentUser.designation
                : currentUser.graduationYear
                    ? `Class of ${currentUser.graduationYear}`
                    : "",
        connections: 128,
        profileViews: 45,
    };

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState("");
    const [posting, setPosting] = useState(false);
    const [openCommentId, setOpenCommentId] = useState(null);
    const [commentDrafts, setCommentDrafts] = useState({});

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const res = await api.get("/posts");
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to load feed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();

        const handleRefresh = () => fetchFeed();
        window.addEventListener("refreshFeed", handleRefresh);
        return () => window.removeEventListener("refreshFeed", handleRefresh);
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        setPosting(true);
        try {
            const res = await api.post("/posts", { content: newPostText });
            setPosts([res.data, ...posts]);
            setNewPostText("");
        } catch (err) {
            console.error("Failed to create post:", err);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await api.post(`/posts/${postId}/like`);
            setPosts(
                posts.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
            );
        } catch (err) {
            console.error("Failed to like post:", err);
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentDrafts[postId];
        if (!text || !text.trim()) return;

        try {
            const res = await api.post(`/posts/${postId}/comment`, { text });
            setPosts(
                posts.map((p) => (p._id === postId ? { ...p, comments: res.data } : p))
            );
            setCommentDrafts({ ...commentDrafts, [postId]: "" });
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const timeAgo = (dateStr) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

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
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
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
                    <form className="create-post-box" onSubmit={handleCreatePost}>
                        <div className="post-avatar-small">
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <input
                            type="text"
                            placeholder="Share an update, achievement or opportunity..."
                            className="create-post-input"
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            disabled={posting}
                        />
                    </form>

                    {loading && <p className="feed-refreshing">Loading feed...</p>}

                    <div className="feed-posts">
                        {posts.map((post) => {
                            const hasLiked = post.likes.includes(currentUser._id);
                            return (
                                <div className="post-card" key={post._id}>
                                    <div className="post-header">
                                        <div className="post-avatar-small">
                                            {post.author?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="post-author">{post.author?.fullName || "Unknown"}</p>
                                            <p className="post-meta">
                                                {roleLabels[post.author?.role] || ""} · {timeAgo(post.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="post-content">{post.content}</p>
                                    <div className="post-actions">
                                        <button
                                            className="post-action"
                                            onClick={() => handleLike(post._id)}
                                            style={hasLiked ? { color: "var(--color-primary)" } : {}}
                                        >
                                            <i className="ti ti-thumb-up" aria-hidden="true"></i>
                                            Like {post.likes.length > 0 && `(${post.likes.length})`}
                                        </button>
                                        <button
                                            className="post-action"
                                            onClick={() => setOpenCommentId(openCommentId === post._id ? null : post._id)}
                                        >
                                            <i className="ti ti-message-circle" aria-hidden="true"></i>
                                            Comment {post.comments.length > 0 && `(${post.comments.length})`}
                                        </button>
                                        <button className="post-action">
                                            <i className="ti ti-share" aria-hidden="true"></i> Share
                                        </button>
                                    </div>

                                    {openCommentId === post._id && (
                                        <div className="comment-section">
                                            {post.comments.map((c) => (
                                                <div className="comment-item" key={c._id}>
                                                    <strong>{c.author?.fullName || "Unknown"}:</strong> {c.text}
                                                </div>
                                            ))}
                                            <div className="comment-input-row">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={commentDrafts[post._id] || ""}
                                                    onChange={(e) =>
                                                        setCommentDrafts({ ...commentDrafts, [post._id]: e.target.value })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAddComment(post._id);
                                                    }}
                                                />
                                                <button onClick={() => handleAddComment(post._id)}>Post</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!loading && posts.length === 0 && (
                            <p className="feed-refreshing">No posts yet. Be the first to share something!</p>
                        )}
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