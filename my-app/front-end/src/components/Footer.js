import React from 'react';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Finch Interest</h4>
          <p>Modern recordkeeping for retirement plans.</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>support@finchinterest.com</p>
        </div>
        <div className="footer-section">
          <p>&copy; {new Date().getFullYear()} Finch Interest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
