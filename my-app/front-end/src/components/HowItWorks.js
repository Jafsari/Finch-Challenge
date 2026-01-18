import React from 'react';

function HowItWorks() {
  return (
    <div className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to get started with Finch Interest</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Connect</h3>
            <p>Connect your HR provider through Finch Connect</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Access</h3>
            <p>View and manage employee data seamlessly</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Maintain</h3>
            <p>Keep accurate records with automated updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
