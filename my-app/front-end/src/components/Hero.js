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
          <div className="hero-logo-card">
            <div className="hero-logo-wrapper">
              <svg className="hero-logo-icon" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 60C20 40 30 30 50 30C60 30 70 35 75 45C75 35 85 30 100 30C115 30 125 40 125 60C125 70 120 80 110 85" stroke="url(#heroLogoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M20 90C20 110 30 120 50 120C60 120 70 115 75 105C75 115 85 120 100 120C115 120 125 110 125 90C125 80 120 70 110 65" stroke="url(#heroLogoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <defs>
                  <linearGradient id="heroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00A37F', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="hero-logo-text"><span className="finch-black">Finch</span> <span className="interest-gradient">Interest</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
