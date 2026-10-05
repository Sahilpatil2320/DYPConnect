import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./DashboardNavbar.css";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { getInitials } from "../utils/getInitials";
import { useState, useEffect } from "react";
import api from "../utils/api";

function DashboardNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const currentUser = getCurrentUser();
    const userInitials = currentUser ? getInitials(currentUser.fullName) : "?";

    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [newOpportunities, setNewOpportunities] = useState(0);
    const [hasNewPosts, setHasNewPosts] = useState(false);
    const [pendingInvitations, setPendingInvitations] = useState(0);

    const handleLogout = () => {
        logoutUser();
        navigate("/");
    };

    const handleLogoClick = () => {
        if (location.pathname === "/dashboard") {
            window.dispatchEvent(new Event("refreshFeed"));
        } else {
            navigate("/dashboard");
        }
    };

    const closeMenu = () => setMenuOpen(false);

    const fetchAllBadges = async () => {
        try {
            const [notifRes, msgRes, oppRes, feedRes, invitesRes] = await Promise.all([
                api.get("/notifications/unread-count"),
                api.get("/chat/unread-count"),
                api.get("/opportunities/unseen-count"),
                api.get("/posts/unseen-check"),
                api.get("/connections/invitations-count"),
            ]);
            setUnreadNotifications(notifRes.data.count);
            setUnreadMessages(msgRes.data.count);
            setNewOpportunities(oppRes.data.count);
            setHasNewPosts(feedRes.data.hasNew);
            setPendingInvitations(invitesRes.data.count);
        } catch (err) {
            console.error("Failed to fetch badge counts:", err);
        }
    };

    useEffect(() => {
        fetchAllBadges();
        const interval = setInterval(fetchAllBadges, 15000);
        window.addEventListener("notificationsUpdated", fetchAllBadges);
        window.addEventListener("badgesUpdated", fetchAllBadges);

        return () => {
            clearInterval(interval);
            window.removeEventListener("notificationsUpdated", fetchAllBadges);
            window.removeEventListener("badgesUpdated", fetchAllBadges);
        };
    }, []);

    return (
        <header className="dash-navbar">
            <div className="dash-navbar-inner">
                <button className="dash-logo" onClick={handleLogoClick} aria-label="Go to dashboard or refresh feed">
                    <img src={logo} alt="DYPConnect logo" className="dash-logo-icon" />
                </button>

                <div className="dash-search">
                    <i className="ti ti-search" aria-hidden="true"></i>
                    <input type="text" placeholder="Search people, posts, opportunities..." readOnly />
                </div>

                <div className="dash-right-group">
                    <nav className="dash-tabs">
                        <Link
                            to="/dashboard"
                            className={`dash-tab ${location.pathname === "/dashboard" ? "dash-tab-active" : ""}`}
                        >
                            <span className="dash-tab-icon-wrapper">
                                <i className="ti ti-home" aria-hidden="true"></i>
                                {hasNewPosts && <span className="dash-dot"></span>}
                            </span>
                            <span>Home</span>
                        </Link>
                        <Link
                            to="/network"
                            className={`dash-tab ${location.pathname === "/network" ? "dash-tab-active" : ""}`}
                        >
                            <span className="dash-tab-icon-wrapper">
                                <i className="ti ti-users" aria-hidden="true"></i>
                                {pendingInvitations > 0 && (
                                    <span className="dash-badge">{pendingInvitations > 9 ? "9+" : pendingInvitations}</span>
                                )}
                            </span>
                            <span>My Network</span>
                        </Link>
                        <Link
                            to="/opportunities"
                            className={`dash-tab ${location.pathname === "/opportunities" ? "dash-tab-active" : ""}`}
                        >
                            <span className="dash-tab-icon-wrapper">
                                <i className="ti ti-briefcase" aria-hidden="true"></i>
                                {newOpportunities > 0 && (
                                    <span className="dash-badge">{newOpportunities > 9 ? "9+" : newOpportunities}</span>
                                )}
                            </span>
                            <span>Opportunities</span>
                        </Link>
                        <Link
                            to="/messages"
                            className={`dash-tab ${location.pathname === "/messages" ? "dash-tab-active" : ""}`}
                        >
                            <span className="dash-tab-icon-wrapper">
                                <i className="ti ti-message-circle" aria-hidden="true"></i>
                                {unreadMessages > 0 && (
                                    <span className="dash-badge">{unreadMessages > 9 ? "9+" : unreadMessages}</span>
                                )}
                            </span>
                            <span>Messaging</span>
                        </Link>
                        <Link
                            to="/notifications"
                            className={`dash-tab ${location.pathname === "/notifications" ? "dash-tab-active" : ""}`}
                        >
                            <span className="dash-tab-icon-wrapper">
                                <i className="ti ti-bell" aria-hidden="true"></i>
                                {unreadNotifications > 0 && (
                                    <span className="dash-badge">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                                )}
                            </span>
                            <span>Notifications</span>
                        </Link>
                    </nav>

                    <div className="dash-profile-menu">
                        <button
                            className="dash-avatar"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Open profile menu"
                        >
                            {userInitials}
                        </button>

                        {menuOpen && (
                            <div className="dash-dropdown">
                                <div className="dash-dropdown-preview">
                                    <div className="dash-dropdown-avatar">{userInitials}</div>
                                    <div>
                                        <Link to={`/profile/${currentUser?._id}`} className="dash-dropdown-name-text" onClick={closeMenu}>
                                            {currentUser?.fullName}
                                        </Link>
                                        <p className="dash-dropdown-role">{currentUser?.role}</p>
                                    </div>
                                </div>

                                <hr className="dash-dropdown-divider" />

                                <Link to={`/profile/${currentUser?._id}`} className="dash-dropdown-item" onClick={closeMenu}>
                                    <i className="ti ti-user" aria-hidden="true"></i>
                                    View Profile
                                </Link>
                                <Link to="/network" className="dash-dropdown-item" onClick={closeMenu}>
                                    <i className="ti ti-users" aria-hidden="true"></i>
                                    My Connections
                                </Link>
                                <Link to="/daily-challenge" className="dash-dropdown-item" onClick={closeMenu}>
                                    <i className="ti ti-flame" aria-hidden="true"></i>
                                    Daily Challenge
                                </Link>

                                <hr className="dash-dropdown-divider" />

                                <button className="dash-dropdown-item" disabled>
                                    <i className="ti ti-settings" aria-hidden="true"></i>
                                    Settings
                                </button>
                                <button className="dash-dropdown-item" disabled>
                                    <i className="ti ti-moon" aria-hidden="true"></i>
                                    Dark Mode
                                </button>
                                <button className="dash-dropdown-item" disabled>
                                    <i className="ti ti-help-circle" aria-hidden="true"></i>
                                    Help & Support
                                </button>

                                <hr className="dash-dropdown-divider" />

                                <button className="dash-dropdown-item dash-dropdown-logout" onClick={handleLogout}>
                                    <i className="ti ti-logout" aria-hidden="true"></i>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default DashboardNavbar;