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
        Connected
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
            <svg className="finch-logo-icon" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="37" cy="37" r="37" fill="#006F77"/>
              <circle cx="36.1017" cy="21.1822" r="5.57627" fill="white"/>
              <path d="M34.1344 31.379C35.3845 35.3814 31.4976 35.961 27.3398 36.1786C23.1819 36.3962 20.2169 44.8267 15.4973 39.1459C14.1181 35.8364 17.1721 31.4149 22.3185 29.2701C27.465 27.1253 32.8842 27.3767 34.1344 31.379Z" fill="#81CACF"/>
              <path d="M38.817 32.44C38.1089 28.3072 42.0383 28.2483 46.1883 28.5843C50.3382 28.9202 54.3955 20.9576 58.3198 27.2143C59.2477 30.6775 55.6342 34.6548 50.2486 36.0979C44.8631 37.5409 39.5251 36.5729 38.817 32.44Z" fill="#81CACF"/>
              <path d="M32.869 39.534C36.6059 41.4358 34.3051 44.6218 31.5558 47.7485C28.8066 50.8753 32.7668 58.8867 25.4051 58.2945C22.0737 56.9691 21.0439 51.695 23.105 46.5144C25.1661 41.3338 29.132 37.6322 32.869 39.534Z" fill="white"/>
              <path d="M39.2017 40.2456C35.8953 42.8242 38.7609 45.5137 42.0552 48.0597C45.3496 50.6057 42.9875 59.2246 50.1018 57.2413C53.1198 55.3057 53.1264 49.932 50.1164 45.2388C47.1064 40.5455 42.5081 37.6669 39.2017 40.2456Z" fill="white"/>
            </svg>
            <span className="finch-logo-text"><span className="finch-black">Acme</span> <span className="interest-gradient">Core</span></span>
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
            href="#orgchart"
            className={activeRoute === 'orgchart' ? 'active' : ''}
            onClick={function(e) { handleNavClick(e, 'orgchart'); }}
          >
            Org Chart
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
        </nav>
        <div className="header-actions">
          {connectionStatus}
        </div>
      </div>
    </header>
  );
}

export default Header;
