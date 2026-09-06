import "./Navbar.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

function Navbar() {
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
          <button className="btn btn-outline">Log In</button>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;