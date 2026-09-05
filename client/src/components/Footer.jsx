import "./Footer.css";
import logo from "../assets/logo.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-logo">
            <img src={logo} alt="DYPConnect logo" className="footer-logo-icon" />
            DYPConnect
          </div>
          <p className="footer-tagline">One Network. Endless Opportunities.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#network">Network</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4>Contact Us</h4>
          <p>D Y Patil College of Engineering<br />and Technology,<br />Kasaba Bawada, Kolhapur</p>
          <p>connect@dypatil.edu</p>
          <p>+91 1234567890</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 DYPConnect. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;