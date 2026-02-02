import React from 'react';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Acme Core</h4>
          <p>Modern recordkeeping for retirement plans.</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>support@acmecore.com</p>
        </div>
        <div className="footer-section">
          <p>&copy; {new Date().getFullYear()} Acme Core. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
