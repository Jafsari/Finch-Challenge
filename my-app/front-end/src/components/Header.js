import React from 'react';

// Header with logo and connection status
function Header(props) {
  var company = props.company;
  
  var connectionStatus = null;
  if (company) {
    connectionStatus = (
      <div className="connection-status">
        Connected to {company.name}
      </div>
    );
  }
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">HR Connect</div>
        <div className="header-actions">
          {connectionStatus}
        </div>
      </div>
    </header>
  );
}

export default Header;
