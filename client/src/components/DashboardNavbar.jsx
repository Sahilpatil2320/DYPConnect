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
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    window.addEventListener("notificationsUpdated", fetchUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", fetchUnreadCount);
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
              <i className="ti ti-home" aria-hidden="true"></i>
              <span>Home</span>
            </Link>
            <Link
              to="/network"
              className={`dash-tab ${location.pathname === "/network" ? "dash-tab-active" : ""}`}
            >
              <i className="ti ti-users" aria-hidden="true"></i>
              <span>My Network</span>
            </Link>
            <Link
              to="/opportunities"
              className={`dash-tab ${location.pathname === "/opportunities" ? "dash-tab-active" : ""}`}
            >
              <i className="ti ti-briefcase" aria-hidden="true"></i>
              <span>Opportunities</span>
            </Link>
            <Link
              to="/messages"
              className={`dash-tab ${location.pathname === "/messages" ? "dash-tab-active" : ""}`}
            >
              <i className="ti ti-message-circle" aria-hidden="true"></i>
              <span>Messaging</span>
            </Link>
            <Link
              to="/notifications"
              className={`dash-tab ${location.pathname === "/notifications" ? "dash-tab-active" : ""}`}
            >
              <span className="dash-tab-icon-wrapper">
                <i className="ti ti-bell" aria-hidden="true"></i>
                {unreadCount > 0 && (
                  <span className="dash-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
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
                <p className="dash-dropdown-name">{currentUser?.fullName}</p>
                <p className="dash-dropdown-role">{currentUser?.role}</p>
                <hr className="dash-dropdown-divider" />
                <button className="dash-dropdown-item" onClick={handleLogout}>
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