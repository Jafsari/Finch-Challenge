import React from 'react';

// Header with logo and connection status
function Header(props) {
  var company = props.company;
  var activeRoute = props.activeRoute || 'organization';
  var onRouteChange = props.onRouteChange;
  
  var connectionStatus = null;
  if (company) {
    connectionStatus = (
      <div className="connection-status">
        Connected to {company.name}
      </div>
    );
  }

  var handleNavClick = function(e, route) {
    e.preventDefault();
    window.location.hash = route;
    if (onRouteChange) {
      onRouteChange(route);
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">Finch Interest</div>
        <nav className="nav-links">
          <a 
            href="#organization" 
            className={activeRoute === 'organization' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'organization'); }}
          >
            Organization
          </a>
          <a 
            href="#payroll"
            className={activeRoute === 'payroll' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'payroll'); }}
          >
            Payroll
          </a>
          <a 
            href="#deductions"
            className={activeRoute === 'deductions' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'deductions'); }}
          >
            Deductions
          </a>
          <a 
            href="#documents"
            className={activeRoute === 'documents' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'documents'); }}
          >
            Documents
          </a>
          <a 
            href="#workforce"
            className={activeRoute === 'workforce' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'workforce'); }}
          >
            Workforce
          </a>
          <a 
            href="#eligibility"
            className={activeRoute === 'eligibility' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'eligibility'); }}
          >
            Eligibility
          </a>
          <a 
            href="#orgchart"
            className={activeRoute === 'orgchart' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'orgchart'); }}
          >
            Org Chart
          </a>
          <a 
            href="#analytics"
            className={activeRoute === 'analytics' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'analytics'); }}
          >
            Analytics
          </a>
          <a 
            href="#audit"
            className={activeRoute === 'audit' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'audit'); }}
          >
            Audit
          </a>
          <a 
            href="#sync"
            className={activeRoute === 'sync' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'sync'); }}
          >
            Enforce Sync
          </a>
        </nav>
        <div className="header-actions">
          {connectionStatus}
        </div>
      </div>
    </header>
  );
}

export default Header;
