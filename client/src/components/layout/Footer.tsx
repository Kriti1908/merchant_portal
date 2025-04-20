import "./footer-style.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-title">Aksion</h3>
            <p className="footer-description">
              Empowering businesses with intelligent chatbot solutions.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#features" className="footer-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="footer-link">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li className="footer-contact">Email: support@aksion.ai</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aksion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}