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
        <div className="logo">
          <div className="finch-logo">
            <svg className="finch-logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 20C8 12 12 8 20 8C24 8 28 10 30 14C30 10 34 8 38 8C42 8 46 12 46 20C46 24 44 28 40 30" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M8 30C8 38 12 42 20 42C24 42 28 40 30 36C30 40 34 42 38 42C42 42 46 38 46 30C46 26 44 22 40 20" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#00A37F', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
            <span className="finch-logo-text"><span className="finch-black">Finch</span> <span className="interest-gradient">Interest</span></span>
          </div>
        </div>
        <nav className="nav-links">
          <a 
            href="#organization" 
            className={activeRoute === 'organization' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'organization'); }}
          >
            Organization
          </a>
          <a 
            href="#orgchart"
            className={activeRoute === 'orgchart' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'orgchart'); }}
          >
            Org Chart
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
            href="#whatschanged"
            className={activeRoute === 'whatschanged' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'whatschanged'); }}
          >
            What's Changed
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
