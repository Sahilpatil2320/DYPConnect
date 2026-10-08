import logo from "../assets/logo.png";
import { useLandingNav } from "../utils/useLandingNav";
import "./Footer.css";

function Footer() {
    const { goToSection, goToTop } = useLandingNav();

    const handleClick = (e, id) => {
        e.preventDefault();
        goToSection(id);
    };

    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div>
                    <button className="footer-logo" onClick={goToTop} aria-label="Back to top">
                        <img src={logo} alt="DYPConnect logo" className="footer-logo-icon" />
                        DYPConnect
                    </button>
                    <p className="footer-tagline">One Network. Endless Opportunities.</p>
                </div>

                <div>
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/#home" onClick={(e) => handleClick(e, "home")}>Home</a></li>
                        <li><a href="/#about" onClick={(e) => handleClick(e, "about")}>About Us</a></li>
                        <li><a href="/#features" onClick={(e) => handleClick(e, "features")}>Features</a></li>
                        <li><a href="/#network" onClick={(e) => handleClick(e, "network")}>Network</a></li>
                        <li><a href="/#contact" onClick={(e) => handleClick(e, "contact")}>Contact</a></li>
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