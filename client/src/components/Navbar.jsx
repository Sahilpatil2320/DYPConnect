import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { getTheme, toggleTheme } from "../utils/theme";
import { useLandingNav } from "../utils/useLandingNav";
import "./Navbar.css";

function Navbar() {
    const [isDark, setIsDark] = useState(getTheme() === "dark");
    const { goToSection, goToTop } = useLandingNav();

    useEffect(() => {
        const handleThemeChange = () => setIsDark(getTheme() === "dark");
        window.addEventListener("themeChanged", handleThemeChange);
        return () => window.removeEventListener("themeChanged", handleThemeChange);
    }, []);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        goToSection(id);
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <button className="navbar-logo" onClick={goToTop} aria-label="Go to DYPConnect home">
                    <img src={logo} alt="DYPConnect logo" className="logo-icon" />
                    <span className="logo-text">
                        DYP<span className="logo-accent">Connect</span>
                    </span>
                </button>

                <nav className="navbar-links">
                    <a href="/#home" onClick={(e) => handleNavClick(e, "home")}>Home</a>
                    <a href="/#about" onClick={(e) => handleNavClick(e, "about")}>About</a>
                    <a href="/#features" onClick={(e) => handleNavClick(e, "features")}>Features</a>
                    <a href="/#network" onClick={(e) => handleNavClick(e, "network")}>Network</a>
                    <a href="/#contact" onClick={(e) => handleNavClick(e, "contact")}>Contact</a>
                </nav>

                <div className="navbar-actions">
                    <Link to="/login" className="btn btn-outline">Log In</Link>
                    <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        title={isDark ? "Light mode" : "Dark mode"}
                    >
                        <i className={`ti ${isDark ? "ti-sun" : "ti-moon"}`} aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;