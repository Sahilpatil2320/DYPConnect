import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { getTheme, toggleTheme } from "../utils/theme";
import "./Navbar.css";

function Navbar() {
    const [isDark, setIsDark] = useState(getTheme() === "dark");

    useEffect(() => {
        const handleThemeChange = () => setIsDark(getTheme() === "dark");
        window.addEventListener("themeChanged", handleThemeChange);
        return () => window.removeEventListener("themeChanged", handleThemeChange);
    }, []);

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <div className="navbar-logo">
                    <img src={logo} alt="DYPConnect logo" className="logo-icon" />
                    <span className="logo-text">
                        DYP<span className="logo-accent">Connect</span>
                    </span>
                </div>

                <nav className="navbar-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#features">Features</a>
                    <a href="#network">Network</a>
                    <a href="#contact">Contact</a>
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