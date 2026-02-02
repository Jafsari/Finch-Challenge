import React from 'react';

function Integrations(props) {
  var onConnect = props.onConnect;

  // Logo component for each integration - using actual brand colors and recognizable designs
  function IntegrationLogo(props) {
    var integrationId = props.integrationId;
    
    switch(integrationId) {
      case 'finch':
        // Finch logo from tryfinch.com
        return (
          <img 
            src="https://cdn.prod.website-files.com/63dd790039a2b29044f7d608/63dd95e9ebe31f280b24f322_logo.svg" 
            alt="Finch" 
            className="finch-logo"
          />
        );
      case 'adp':
        // ADP - Red brand color #D32F2F
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#D32F2F"/>
            <text x="24" y="32" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="0.5px">ADP</text>
          </svg>
        );
      case 'workday':
        // Workday logo from Finch's CDN
        return (
          <img 
            src="https://cdn.prod.website-files.com/63dd790039a2b29044f7d608/689c93efd76daf77e359a1f8_workday.svg" 
            alt="Workday" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={function(e) {
              // Fallback if direct URL doesn't work
              e.target.src = 'https://logo.clearbit.com/workday.com';
            }}
          />
        );
      case 'paychex':
        // Paychex logo - SVG with brand colors
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="paychex-logo">
            <rect width="48" height="48" rx="10" fill="#003087"/>
            <text x="24" y="28" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="0.5px">PAYCHEX</text>
          </svg>
        );
      case 'bamboohr':
        // BambooHR - Green brand color #00A37F
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#00A37F"/>
            <path d="M24 14L28 20H20L24 14Z" fill="white"/>
            <path d="M20 24L24 30L28 24H20Z" fill="white"/>
            <path d="M24 34L20 28H28L24 34Z" fill="white"/>
          </svg>
        );
      case 'gusto':
        // Gusto logo from Finch's CDN
        return (
          <img 
            src="https://cdn.prod.website-files.com/63deb4700c95fc8b0d114fde/66453130e4d3abf83dea2dd6_gusto.svg" 
            alt="Gusto" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={function(e) {
              // Fallback if direct URL doesn't work
              e.target.src = 'https://logo.clearbit.com/gusto.com';
            }}
          />
        );
      case 'paycom':
        // Paycom logo - using official logo image
        return (
          <img 
            src="/paycom-logo.png" 
            alt="Paycom" 
            className="paycom-logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        );
      case 'justworks':
        // Justworks - Blue brand color #4A90E2
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#4A90E2"/>
            <path d="M24 14L32 24L24 34L16 24L24 14Z" fill="white"/>
          </svg>
        );
      case 'rippling':
        // Rippling - Indigo brand color #6366F1
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#6366F1"/>
            <circle cx="24" cy="20" r="4" fill="white" opacity="0.9"/>
            <circle cx="24" cy="24" r="6" fill="white" opacity="0.7"/>
            <circle cx="24" cy="28" r="4" fill="white" opacity="0.9"/>
          </svg>
        );
      case 'zenefits':
        // Zenefits - Cyan brand color #00B8D4
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#00B8D4"/>
            <path d="M24 16L32 24L24 32L16 24L24 16Z" fill="white"/>
          </svg>
        );
      case 'paylocity':
        // Paylocity - Green brand color #00A651
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#00A651"/>
            <text x="24" y="30" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="0.5px">PAYLOCITY</text>
          </svg>
        );
      case 'ceridian':
        // Ceridian - Red brand color #E31837
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#E31837"/>
            <circle cx="24" cy="24" r="10" fill="white"/>
            <circle cx="24" cy="24" r="6" fill="#E31837"/>
          </svg>
        );
      default:
        return (
          <div className="integration-logo-placeholder">
            {props.name.charAt(0)}
          </div>
        );
    }
  }

  var integrations = [
    {
      id: 'finch',
      name: 'Finch',
      description: 'Connect to 250+ HRIS systems through Finch',
      category: 'Integration Platform',
      featured: true
    },
    {
      id: 'adp',
      name: 'ADP',
      description: 'Workforce Now, Run, Vantage',
      category: 'Payroll & HRIS'
    },
    {
      id: 'workday',
      name: 'Workday',
      description: 'Human Capital Management',
      category: 'HRIS'
    },
    {
      id: 'paychex',
      name: 'Paychex',
      description: 'Payroll and HR solutions',
      category: 'Payroll'
    },
    {
      id: 'bamboohr',
      name: 'BambooHR',
      description: 'HR software for small businesses',
      category: 'HRIS'
    },
    {
      id: 'gusto',
      name: 'Gusto',
      description: 'People platform for small businesses',
      category: 'Payroll'
    },
    {
      id: 'paycom',
      name: 'Paycom',
      description: 'Single-application HR technology',
      category: 'HRIS'
    },
    {
      id: 'justworks',
      name: 'Justworks',
      description: 'PEO and HR platform',
      category: 'PEO'
    },
    {
      id: 'rippling',
      name: 'Rippling',
      description: 'Unified workforce management',
      category: 'HRIS'
    },
    {
      id: 'zenefits',
      name: 'Zenefits',
      description: 'All-in-one HR platform',
      category: 'HRIS'
    },
    {
      id: 'paylocity',
      name: 'Paylocity',
      description: 'Cloud-based payroll and HR',
      category: 'Payroll'
    },
    {
      id: 'ceridian',
      name: 'Ceridian',
      description: 'Dayforce HCM platform',
      category: 'HRIS'
    }
  ];

  return (
    <div className="integrations-section">
      <div className="integrations-container">
        <div className="integrations-header">
          <h1 className="integrations-title">Connect Your HR Provider</h1>
          <p className="integrations-subtitle">
            Acme Core integrates with 250+ HRIS and payroll systems through Finch. 
            Connect your provider to access census, payroll, and deductions data.
          </p>
        </div>
        
        <div className="integrations-grid">
          {integrations.map(function(integration) {
            var isFinch = integration.id === 'finch';
            
            return (
              <div 
                key={integration.id} 
                className={"integration-card" + (isFinch ? " featured" : "")}
              >
                {isFinch && (
                  <div className="integration-badge">Recommended</div>
                )}
                <div className="integration-card-header">
                  <div className="integration-logo">
                    <IntegrationLogo integrationId={integration.id} name={integration.name} />
                  </div>
                  <div className="integration-info">
                    <h3 className="integration-name">{integration.name}</h3>
                    <span className="integration-category">{integration.category}</span>
                  </div>
                </div>
                <p className="integration-description">{integration.description}</p>
                {isFinch ? (
                  <button 
                    className="integration-connect-button"
                    onClick={onConnect}
                  >
                    Connect Your HR Provider
                  </button>
                ) : (
                  <div className="integration-status">
                    <span className="integration-status-text">Available via Finch</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Integrations;
