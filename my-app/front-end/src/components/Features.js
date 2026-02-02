import React from 'react';

function Features() {
  return (
    <div className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Why Choose Acme Core</h2>
          <p>Everything you need for seamless and secure retirement plan recordkeeping.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Integration</h3>
            <p>Connect with confidence using industry-leading security protocols.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Comprehensive Data</h3>
            <p>Access complete employee information for accurate recordkeeping.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Updates</h3>
            <p>Stay up-to-date with automated data synchronization.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
