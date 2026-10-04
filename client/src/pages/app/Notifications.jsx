import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getInitials } from "../../utils/getInitials";
import "./Notifications.css";

function Notifications() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const typeToFilter = {
        like: "like",
        comment: "comment",
        connection_request: "connection",
        connection_accepted: "connection",
    };

    const typeIcon = {
        like: "ti-thumb-up",
        comment: "ti-message-circle",
        connection_request: "ti-user-plus",
        connection_accepted: "ti-user-check",
    };

    const filters = [
        { id: "all", label: "All" },
        { id: "connection", label: "Connections" },
        { id: "like", label: "Likes" },
        { id: "comment", label: "Comments" },
    ];

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications =
        activeFilter === "all"
            ? notifications
            : notifications.filter((n) => typeToFilter[n.type] === activeFilter);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications(notifications.map((n) => ({ ...n, read: true })));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
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

    return (
        <div className="notifications-page">
            <div className="notifications-container">
                <div className="notifications-top">
                    <div>
                        <h1 className="notifications-heading">Notifications</h1>
                        <p className="notifications-subheading">
                            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-read-btn" onClick={markAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="notifications-filters">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            className={`filter-chip ${activeFilter === f.id ? "filter-chip-active" : ""}`}
                            onClick={() => setActiveFilter(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading && <p className="notifications-empty">Loading...</p>}

                <div className="notifications-list">
                    {!loading &&
                        filteredNotifications.map((n) => (
                            <button
                                key={n._id}
                                className={`notification-item ${!n.read ? "notification-item-unread" : ""}`}
                                onClick={() => markAsRead(n._id)}
                            >
                                {n.sender ? (
                                    <div className="post-avatar-small">{getInitials(n.sender.fullName)}</div>
                                ) : (
                                    <div className="notification-icon-circle">
                                        <i className={`ti ${typeIcon[n.type] || "ti-bell"}`} aria-hidden="true"></i>
                                    </div>
                                )}
                                <div className="notification-info">
                                    <p className="notification-text">{n.text}</p>
                                    <p className="notification-time">{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.read && <span className="unread-dot"></span>}
                            </button>
                        ))}

                    {!loading && filteredNotifications.length === 0 && (
                        <p className="notifications-empty">No notifications here yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Notifications;