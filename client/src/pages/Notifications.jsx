import { useState } from "react";
import "./Notifications.css";

function Notifications() {
  const [activeFilter, setActiveFilter] = useState("all");

  const initialNotifications = [
    {
      id: 1,
      type: "connection",
      icon: "ti-user-plus",
      initials: "OR",
      text: "Om Raut sent you a connection request",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "like",
      icon: "ti-thumb-up",
      initials: "AD",
      text: "Prof. Anjali Deshmukh liked your post",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "comment",
      icon: "ti-message-circle",
      initials: "RS",
      text: "Rohan Shinde commented on your post: \"Great initiative!\"",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 4,
      type: "event",
      icon: "ti-calendar-event",
      initials: null,
      text: "Reminder: AI/ML Bootcamp starts in 2 days",
      time: "5 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "connection",
      icon: "ti-user-check",
      initials: "PK",
      text: "Priya Kulkarni accepted your connection request",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 6,
      type: "opportunity",
      icon: "ti-briefcase",
      initials: null,
      text: "New internship posted: Frontend Developer Intern at Zeta Technologies",
      time: "2 days ago",
      unread: false,
    },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  const filters = [
    { id: "all", label: "All" },
    { id: "connection", label: "Connections" },
    { id: "like", label: "Likes" },
    { id: "comment", label: "Comments" },
    { id: "event", label: "Events" },
    { id: "opportunity", label: "Opportunities" },
  ];

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
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

        <div className="notifications-list">
          {filteredNotifications.map((n) => (
            <button
              key={n.id}
              className={`notification-item ${n.unread ? "notification-item-unread" : ""}`}
              onClick={() => markAsRead(n.id)}
            >
              {n.initials ? (
                <div className="post-avatar-small">{n.initials}</div>
              ) : (
                <div className="notification-icon-circle">
                  <i className={`ti ${n.icon}`} aria-hidden="true"></i>
                </div>
              )}
              <div className="notification-info">
                <p className="notification-text">{n.text}</p>
                <p className="notification-time">{n.time}</p>
              </div>
              {n.unread && <span className="unread-dot"></span>}
            </button>
          ))}

          {filteredNotifications.length === 0 && (
            <p className="notifications-empty">No notifications here yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;