import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cart from "../components/Cart";
import "../styles/about.css";

function AboutPage() {
  const [readMore, setReadMore] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleReadMore = () => {
    setReadMore(!readMore);
  };

  return (
    <>
      <Navbar />
      <div className={`about-container ${isVisible ? 'fade-in' : ''}`}>
        {/* Hero Section */}
        <header className="hero-section animate-slide-up">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="highlight">Smart Agro</span>
            </h1>
            <p className="hero-description">
              Revolutionizing agriculture through IoT technology to monitor and
              control field conditions efficiently and sustainably.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Efficiency</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Sensors</span>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <img
              src="/image/logo-SA.jpg"
              alt="Smart Agriculture Technology"
              className="hero-image"
            />
            <div className="floating-elements">
              <div className="floating-icon icon-1">🌱</div>
              <div className="floating-icon icon-2">💧</div>
              <div className="floating-icon icon-3">☀️</div>
            </div>
          </div>
        </header>

        {/* Introduction Section */}
        <section className="section introduction animate-slide-up">
          <div className="section-header">
            <h2>
              <span className="section-number">01</span>
              Introduction
            </h2>
            <div className="section-line"></div>
          </div>
          
          <div className="content-card">
            <p className="intro-text">
              IoT-based agriculture monitoring revolutionizes farming by utilizing
              connected devices to collect real-time data. This approach combines
              crop and soil monitoring with meteorological data, enabling farmers
              to enhance output and sustainability.
            </p>
            
            {readMore && (
              <div className="expanded-content animate-expand">
                <p>
                  The project focuses on automating tasks such as irrigation, light
                  intensity monitoring, and climate control using IoT. Devices like
                  DHT11 sensors measure temperature and humidity, while soil
                  moisture sensors ensure optimal water usage. This integration
                  helps maintain crop quality, optimize resources, and protect soil
                  fertility.
                </p>
                
                <div className="benefits-grid">
                  <h3 className="benefits-title">Benefits of IoT-Based Agriculture Monitoring</h3>
                  <div className="benefits-cards">
                    <div className="benefit-card">
                      <div className="benefit-icon">📊</div>
                      <h4>Improved Resource Management</h4>
                      <p>Optimize water, fertilizer, and energy usage</p>
                    </div>
                    <div className="benefit-card">
                      <div className="benefit-icon">🌾</div>
                      <h4>Enhanced Crop Quality</h4>
                      <p>Monitor conditions for better yields</p>
                    </div>
                    <div className="benefit-card">
                      <div className="benefit-icon">💰</div>
                      <h4>Cost Reduction</h4>
                      <p>Reduce operational expenses and waste</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleReadMore}
              className="read-more-btn"
            >
              <span>{readMore ? "Read Less" : "Read More"}</span>
              <div className="btn-arrow">
                {readMore ? "▲" : "▼"}
              </div>
            </button>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="section objectives animate-slide-up">
          <div className="section-header">
            <h2>
              <span className="section-number">02</span>
              Objectives
            </h2>
            <div className="section-line"></div>
          </div>
          
          <div className="objectives-grid">
            <div className="objective-card">
              <div className="objective-icon">🌡️</div>
              <h3>Temperature & Humidity Control</h3>
              <p>Monitor and control environmental conditions using advanced DHT11 sensors for optimal crop growth.</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">💧</div>
              <h3>Smart Irrigation System</h3>
              <p>Automate irrigation with soil moisture sensors and intelligent water pump control systems.</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">☀️</div>
              <h3>Light Intensity Monitoring</h3>
              <p>Measure and regulate light intensity to optimize photosynthesis and promote healthy plant growth.</p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="section tech-stack animate-slide-up">
          <div className="section-header">
            <h2>
              <span className="section-number">03</span>
              Technology Stack
            </h2>
            <div className="section-line"></div>
          </div>
          
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon">📡</div>
              <span>IoT Sensors</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon">📱</div>
              <span>Mobile App</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon">☁️</div>
              <span>Cloud Platform</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon">🤖</div>
              <span>AI Analytics</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon">📊</div>
              <span>Real-time Data</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon">🔧</div>
              <span>Automation</span>
            </div>
          </div>
        </section>

        {/* Cart Section */}
        <section className="section cart-section animate-slide-up">
          <div className="section-header">
            <h2>
              <span className="section-number">04</span>
              Products & Solutions
            </h2>
            <div className="section-line"></div>
          </div>
          <Cart />
        </section>
      </div>
      <Footer />
    </>
  );
}

export default AboutPage;