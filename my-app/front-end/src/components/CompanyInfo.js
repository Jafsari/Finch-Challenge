import React from 'react';

// Company info display
function CompanyInfo(props) {
  var company = props.company;
  var loading = props.loading;
  var error = props.error;
  
  // Don't show anything if we're loading or there's an error
  if (loading || error) {
    return null;
  }
  
  // Don't show if no company data
  if (!company) {
    return null;
  }

  return (
    <div className="company-info">
      <h2>Company Information</h2>
      <p><strong>Company Name:</strong> {company.name || 'Not available'}</p>
      {company.website && (
        <p><strong>Website:</strong> {company.website}</p>
      )}
    </div>
  );
}

export default CompanyInfo;
