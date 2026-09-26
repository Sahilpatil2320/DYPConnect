import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./DashboardNavbar.css";

function DashboardNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoClick = () => {
        if (location.pathname === "/dashboard") {
            window.dispatchEvent(new Event("refreshFeed"));
        } else {
            navigate("/dashboard");
        }
    };

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

                {/* <nav className="dash-tabs">
                    <Link to="/dashboard" className="dash-tab dash-tab-active">
                        <i className="ti ti-home" aria-hidden="true"></i>
                        <span>Home</span>
                    </Link>
                    <Link to="/network" className="dash-tab">
                        <i className="ti ti-users" aria-hidden="true"></i>
                        <span>My Network</span>
                    </Link>
                    <Link to="/opportunities" className="dash-tab">
                        <i className="ti ti-briefcase" aria-hidden="true"></i>
                        <span>Opportunities</span>
                    </Link>
                    <Link to="/messages" className="dash-tab">
                        <i className="ti ti-message-circle" aria-hidden="true"></i>
                        <span>Messaging</span>
                    </Link>
                    <Link to="/notifications" className="dash-tab">
                        <i className="ti ti-bell" aria-hidden="true"></i>
                        <span>Notifications</span>
                    </Link>
                </nav>

                <div className="dash-profile-menu">
                    <div className="dash-avatar">SP</div>
                </div> */}

                <div className="dash-right-group">
  <nav className="dash-tabs">
    <Link to="/dashboard" className="dash-tab dash-tab-active">
      <i className="ti ti-home" aria-hidden="true"></i>
      <span>Home</span>
    </Link>
    <Link to="/network" className="dash-tab">
      <i className="ti ti-users" aria-hidden="true"></i>
      <span>My Network</span>
    </Link>
    <Link to="/opportunities" className="dash-tab">
      <i className="ti ti-briefcase" aria-hidden="true"></i>
      <span>Opportunities</span>
    </Link>
    <Link to="/messages" className="dash-tab">
      <i className="ti ti-message-circle" aria-hidden="true"></i>
      <span>Messaging</span>
    </Link>
    <Link to="/notifications" className="dash-tab">
      <i className="ti ti-bell" aria-hidden="true"></i>
      <span>Notifications</span>
    </Link>
  </nav>

  <div className="dash-profile-menu">
    <div className="dash-avatar">SP</div>
  </div>
</div>
            </div>
        </header>
    );
}

export default DashboardNavbar;