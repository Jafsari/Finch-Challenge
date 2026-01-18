import React from 'react';

function Hero(props) {
  var onConnect = props.onConnect;
  var company = props.company;

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Modern Recordkeeping for Retirement Plans</h1>
          <p className="hero-subtitle">
            Connect your HR provider to access employee data and maintain accurate retirement plan records.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={onConnect}>
              Connect Your HR Provider
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-placeholder"></div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
