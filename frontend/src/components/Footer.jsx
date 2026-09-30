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
            <a href="mailto:hiteshdangol@gmail.com">hiteshdangol@gmail.com</a>
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+977-9860689445">+977-9860689445</a>
          </p>
       
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a href="https://www.linkedin.com/in/hitesh-dangol-62415a230/" target="_blank" rel="noopener noreferrer">
              Hitesh Dangol
            </a>
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © 2026 Smart Agro. All rights reserved. 🌾
            <span className="footer-note"> Happy Farming with Smart Famring System!</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
