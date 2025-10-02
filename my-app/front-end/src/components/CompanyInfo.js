import React from 'react';

// Company info display
function CompanyInfo(props) {
  var company = props.company;
  
  if (!company) {
    return null;
  }

  return (
    <div className="company-info">
      <h2>Company Information</h2>
      <p><strong>Company Name:</strong> {company.name}</p>
    </div>
  );
}

export default CompanyInfo;
