import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth";
import { getInitials } from "../../utils/getInitials";
import { getTheme, toggleTheme } from "../../utils/theme";
import api from "../../utils/api";
import "./Dashboard.css";
import { useEscapeKey } from "../../utils/useEscapeKey";

const PAGE_SIZE = 10;

function Dashboard() {
    const currentUser = getCurrentUser();
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logoutUser();
        navigate("/");
    };

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
    };

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [newPostText, setNewPostText] = useState("");
    const [posting, setPosting] = useState(false);
    const [openCommentId, setOpenCommentId] = useState(null);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [showPostModal, setShowPostModal] = useState(false);
    useEscapeKey(() => setShowPostModal(false), showPostModal);
    const [streak, setStreak] = useState(0);
    const [stats, setStats] = useState({ connections: 0, posts: 0 });
    const [latestOpportunities, setLatestOpportunities] = useState([]);
    const [isDark, setIsDark] = useState(getTheme() === "dark");

    const handleToggleDarkMode = () => {
        toggleTheme();
        setIsDark(getTheme() === "dark");
    };

    useEffect(() => {
        const handleThemeChange = () => setIsDark(getTheme() === "dark");
        window.addEventListener("themeChanged", handleThemeChange);
        return () => window.removeEventListener("themeChanged", handleThemeChange);
    }, []);

    const fetchFeed = async (pageToLoad = 1) => {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const res = await api.get(`/posts?page=${pageToLoad}&limit=${PAGE_SIZE}`);
            const incoming = res.data.posts;

            setPosts((prev) =>
                pageToLoad === 1
                    ? incoming
                    : [...prev, ...incoming.filter((p) => !prev.some((existing) => existing._id === p._id))]
            );
            setHasMore(res.data.hasMore);
            setPage(pageToLoad);
        } catch (err) {
            console.error("Failed to load feed:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchFeed(1);

        const handleRefresh = () => fetchFeed(1);
        window.addEventListener("refreshFeed", handleRefresh);
        return () => window.removeEventListener("refreshFeed", handleRefresh);
    }, []);

    useEffect(() => {
        const loadSidebarData = async () => {
            try {
                const [streakRes, statsRes, oppRes] = await Promise.all([
                    api.get("/challenge/streak"),
                    api.get("/users/stats"),
                    api.get("/opportunities?limit=3"),
                ]);
                setStreak(streakRes.data.currentStreak);
                setStats(statsRes.data);
                setLatestOpportunities(oppRes.data);
            } catch (err) {
                console.error("Failed to load sidebar data:", err);
            }
        };
        loadSidebarData();
    }, []);

    useEffect(() => {
        const markVisited = async () => {
            try {
                await api.put("/posts/mark-visited");
                window.dispatchEvent(new Event("badgesUpdated"));
            } catch (err) {
                console.error("Failed to mark feed as visited:", err);
            }
        };
        markVisited();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        setPosting(true);
        try {
            const res = await api.post("/posts", { content: newPostText });
            setPosts((prev) => [res.data, ...prev]);
            setStats((s) => ({ ...s, posts: s.posts + 1 }));
            setNewPostText("");
            setShowPostModal(false);
        } catch (err) {
            console.error("Failed to create post:", err);
        } finally {
            setPosting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete this post? This can't be undone.")) return;

        try {
            await api.delete(`/posts/${postId}`);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
            setStats((s) => ({ ...s, posts: Math.max(0, s.posts - 1) }));
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await api.post(`/posts/${postId}/like`);
            setPosts((prev) =>
                prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
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
            setPosts((prev) =>
                prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p))
            );
            setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const timeAgo = (dateStr) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const opportunityTag = (type) =>
        type === "internship" || type === "job" ? "opportunity" : "event";

    const typeLabel = (type) => type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div className="dashboard">
            <div className="dashboard-grid">
                <aside className="dashboard-left">
                    <div className="profile-card">
                        <div className="profile-avatar">{getInitials(user.name)}</div>
                        <h3 className="profile-name">{user.name}</h3>
                        <p className="profile-role">{user.role} · {user.department}</p>
                        <p className="profile-year">{user.year}</p>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <span className="stat-num">{stats.connections}</span>
                                <span className="stat-label">Connections</span>
                            </div>
                            <div className="profile-stat">
                                <span className="stat-num">{stats.posts}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                        </div>

                        <hr className="sidebar-shortcut-divider" />

                        <Link to={`/profile/${currentUser._id}`} className="sidebar-shortcut-item">
                            <i className="ti ti-user" aria-hidden="true"></i>
                            View Profile
                        </Link>
                        <hr className="sidebar-shortcut-divider" />

                        <Link to="/network" className="sidebar-shortcut-item">
                            <i className="ti ti-users" aria-hidden="true"></i>
                            My Connections
                        </Link>
                        <hr className="sidebar-shortcut-divider" />

                        <Link to="/daily-challenge" className="sidebar-shortcut-item">
                            <i className={`ti ti-flame ${streak > 0 ? "streak-icon-active" : ""}`} aria-hidden="true"></i>
                            Daily Challenge
                            {streak > 0 && <span className="sidebar-streak-count">{streak}</span>}
                        </Link>
                        <hr className="sidebar-shortcut-divider" />

                        <button className="sidebar-shortcut-item" onClick={handleToggleDarkMode}>
                            <i className={`ti ${isDark ? "ti-sun" : "ti-moon"}`} aria-hidden="true"></i>
                            {isDark ? "Light Mode" : "Dark Mode"}
                        </button>
                        <hr className="sidebar-shortcut-divider" />

                        <button className="sidebar-shortcut-item" disabled>
                            <i className="ti ti-settings" aria-hidden="true"></i>
                            Settings
                        </button>
                        <hr className="sidebar-shortcut-divider" />

                        <button className="sidebar-shortcut-item" disabled>
                            <i className="ti ti-help-circle" aria-hidden="true"></i>
                            Help & Support
                        </button>
                        <hr className="sidebar-shortcut-divider" />

                        <button
                            className="sidebar-shortcut-item sidebar-shortcut-logout"
                            onClick={handleLogoutClick}
                        >
                            <i className="ti ti-logout" aria-hidden="true"></i>
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="dashboard-feed">
                    <div className="create-post-box" onClick={() => setShowPostModal(true)}>
                        <div className="post-avatar-small">{getInitials(user.name)}</div>
                        <div className="create-post-input">
                            Share an update, achievement or opportunity...
                        </div>
                    </div>

                    {showPostModal && (
                        <div className="post-modal-overlay" onClick={() => setShowPostModal(false)}>
                            <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="post-modal-header">
                                    <h3>Create a post</h3>
                                    <button className="post-modal-close" onClick={() => setShowPostModal(false)}>
                                        <i className="ti ti-x" aria-hidden="true"></i>
                                    </button>
                                </div>

                                <div className="post-modal-user">
                                    <div className="post-avatar-small">{getInitials(user.name)}</div>
                                    <div>
                                        <p className="post-author">{user.name}</p>
                                        <p className="post-meta">{user.role} · {user.department}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        className="post-modal-textarea"
                                        placeholder="What do you want to talk about?"
                                        value={newPostText}
                                        onChange={(e) => setNewPostText(e.target.value)}
                                        disabled={posting}
                                        autoFocus
                                        rows={6}
                                        maxLength={3000}
                                    />
                                    <div className="post-modal-footer">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={posting || !newPostText.trim()}
                                        >
                                            {posting ? "Posting..." : "Post"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {loading && <p className="feed-refreshing">Loading feed...</p>}

                    <div className="feed-posts">
                        {posts.map((post) => {
                            const hasLiked = post.likes.includes(currentUser._id);
                            const isMine = post.author?._id === currentUser._id;

                            return (
                                <div className="post-card" key={post._id}>
                                    <div className="post-header">
                                        <div className="post-avatar-small">{getInitials(post.author?.fullName)}</div>
                                        <div>
                                            <p className="post-author">{post.author?.fullName || "Unknown"}</p>
                                            <p className="post-meta">
                                                {roleLabels[post.author?.role] || ""} · {timeAgo(post.createdAt)}
                                            </p>
                                        </div>
                                        {isMine && (
                                            <button
                                                className="post-delete-btn"
                                                onClick={() => handleDeletePost(post._id)}
                                                aria-label="Delete post"
                                                title="Delete post"
                                            >
                                                <i className="ti ti-trash" aria-hidden="true"></i>
                                            </button>
                                        )}
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
                                                        setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAddComment(post._id);
                                                    }}
                                                    maxLength={500}
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

                    {hasMore && (
                        <button
                            className="feed-load-more"
                            onClick={() => fetchFeed(page + 1)}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Loading..." : "Load more posts"}
                        </button>
                    )}
                </main>

                <aside className="dashboard-right">
                    <h4 className="sidebar-heading">Latest Opportunities</h4>

                    {latestOpportunities.length === 0 ? (
                        <p className="sidebar-empty">No opportunities posted yet.</p>
                    ) : (
                        <div className="event-list">
                            {latestOpportunities.map((item) => (
                                <div className="event-item" key={item._id}>
                                    <span className={`event-tag event-tag-${opportunityTag(item.type)}`}>
                                        {typeLabel(item.type)}
                                    </span>
                                    <p className="event-title">{item.title}</p>
                                    <p className="event-date">
                                        {item.org}
                                        {item.deadline ? ` · ${item.deadline}` : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link to="/opportunities" className="sidebar-viewall">
                        View all opportunities →
                    </Link>
                </aside>
            </div>
        </div>
    );
}

export default Dashboard;