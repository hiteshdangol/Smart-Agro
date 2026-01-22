import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-logo">
          <h1>Smart Farming</h1>
          <p className="footer-tagline">Innovating Farming for a Sustainable Future</p>
        </div>

        {/* Contact Information */}
        <div className="footer-contact">
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:ujanmaharjan1901@gmail.com">ujanmaharjan1901@gmail.com/sandesh@gmail.com</a>
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+919867076536">+91-9867076536</a>
          </p>
       
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a href="https://www.linkedin.com/in/ujan-maharjan-096608381/" target="_blank" rel="noopener noreferrer">
              Ujan Maharjan
            </a>
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © 2025 Smart Agro. All rights reserved. 🌾
            <span className="footer-note"> Happy Farming with Smart Famring System!</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
