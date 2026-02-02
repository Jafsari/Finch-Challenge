import React from 'react';
import EmployerSelector from './EmployerSelector';

// Company info display
function CompanyInfo(props) {
  var company = props.company;
  var loading = props.loading;
  var error = props.error;
  var selectedEmployer = props.selectedEmployer;
  var onEmployerChange = props.onEmployerChange;
  
  // Don't show anything if we're loading or there's an error
  if (loading || error) {
    return null;
  }
  
  // Don't show if no company data
  if (!company) {
    return null;
  }

  // Helper function to format value or hide if not available
  function formatValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return value;
  }

  // Helper function to format dates
  function formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }

  // Extract nested data
  var entity = company.entity || {};
  var location = company.locations && company.locations[0] ? company.locations[0] : (company.location || {});
  var accounts = company.accounts || [];
  var departments = company.departments || [];

  return (
    <div id="organization" className="company-info-section">
      <div className="company-header-card">
        <div className="company-header-main">
          <div className="company-header-content">
            <h2 className="company-header-title">{company.legal_name || company.name || 'Organization Information'}</h2>
            {company.primary_email && (
              <div className="company-header-subtitle">{company.primary_email}</div>
            )}
          </div>
          <div className="company-header-actions">
            <EmployerSelector 
              selectedEmployer={selectedEmployer}
              onEmployerChange={onEmployerChange}
            />
          </div>
        </div>
      </div>

      <div className="company-details-grid">
        {/* Basic Information */}
        <div className="company-detail-section">
          <h3 className="detail-section-title">Basic Information</h3>
          <div className="company-detail-table">
            {company.id && (
              <div className="detail-row">
                <span className="detail-label">ID</span>
                <span className="detail-value">{company.id}</span>
              </div>
            )}
            {company.name && company.name !== company.legal_name && (
              <div className="detail-row">
                <span className="detail-label">Display Name</span>
                <span className="detail-value">{company.name}</span>
              </div>
            )}
            {company.legal_name && (
              <div className="detail-row">
                <span className="detail-label">Legal Name</span>
                <span className="detail-value">{company.legal_name}</span>
              </div>
            )}
            {entity.type && (
              <div className="detail-row">
                <span className="detail-label">Entity Type</span>
                <span className="detail-value">{entity.type}</span>
              </div>
            )}
            {entity.subtype && (
              <div className="detail-row">
                <span className="detail-label">Entity Subtype</span>
                <span className="detail-value">{entity.subtype}</span>
              </div>
            )}
            {company.ein && (
              <div className="detail-row">
                <span className="detail-label">EIN</span>
                <span className="detail-value">{company.ein}</span>
              </div>
            )}
            {company.website && (
              <div className="detail-row">
                <span className="detail-label">Website</span>
                <span className="detail-value">
                  <a href={company.website.startsWith('http') ? company.website : 'https://' + company.website} target="_blank" rel="noopener noreferrer" className="company-link">
                    {company.website}
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {(company.primary_email || company.primary_phone_number || company.phone_numbers) && (
          <div className="company-detail-section">
            <h3 className="detail-section-title">Contact Information</h3>
            <div className="company-detail-table">
              {company.primary_email && (
                <div className="detail-row">
                  <span className="detail-label">Primary Email</span>
                  <span className="detail-value">
                    <a href={'mailto:' + company.primary_email} className="company-link">{company.primary_email}</a>
                  </span>
                </div>
              )}
              {company.primary_phone_number && (
                <div className="detail-row">
                  <span className="detail-label">Primary Phone</span>
                  <span className="detail-value">{company.primary_phone_number}</span>
                </div>
              )}
              {company.phone_numbers && company.phone_numbers.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Phone Numbers</span>
                  <span className="detail-value">
                    {company.phone_numbers.map(function(phone, idx) {
                      return <div key={idx}>{phone.data || phone}</div>;
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Information */}
        {(location.line1 || location.city || location.state || location.postal_code || location.country) && (
          <div className="company-detail-section">
            <h3 className="detail-section-title">Location</h3>
            <div className="company-detail-table">
              {location.line1 && (
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{location.line1}</span>
                </div>
              )}
              {location.line2 && (
                <div className="detail-row">
                  <span className="detail-label">Address Line 2</span>
                  <span className="detail-value">{location.line2}</span>
                </div>
              )}
              {(location.city || location.state || location.postal_code) && (
                <div className="detail-row">
                  <span className="detail-label">City, State ZIP</span>
                  <span className="detail-value">
                    {[location.city, location.state, location.postal_code].filter(function(part) { return part; }).join(', ')}
                  </span>
                </div>
              )}
              {location.country && (
                <div className="detail-row">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">{location.country}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts */}
        {accounts.length > 0 && (
          <div className="company-detail-section">
            <h3 className="detail-section-title">Accounts ({accounts.length})</h3>
            <div className="company-detail-table">
              {accounts.map(function(account, idx) {
                return (
                  <div key={idx} className="detail-row">
                    <span className="detail-label">Account {idx + 1}</span>
                    <span className="detail-value">
                      {account.institution_name || account.account_name || 'Account'}
                      {account.routing_number && ' • ' + account.routing_number}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Departments */}
        {departments.length > 0 && (
          <div className="company-detail-section">
            <h3 className="detail-section-title">Departments ({departments.length})</h3>
            <div className="company-detail-table">
              {departments.slice(0, 10).map(function(dept, idx) {
                var deptName = typeof dept === 'string' ? dept : (dept.name || dept.department || 'Department');
                return (
                  <div key={idx} className="detail-row">
                    <span className="detail-label">Department {idx + 1}</span>
                    <span className="detail-value">{deptName}</span>
                  </div>
                );
              })}
              {departments.length > 10 && (
                <div className="detail-row">
                  <span className="detail-label"></span>
                  <span className="detail-value">+ {departments.length - 10} more departments</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Fields */}
        {(company.created_at || company.updated_at || company.source_id) && (
          <div className="company-detail-section">
            <h3 className="detail-section-title">System Information</h3>
            <div className="company-detail-table">
              {company.created_at && (
                <div className="detail-row">
                  <span className="detail-label">Created At</span>
                  <span className="detail-value">{formatDate(company.created_at)}</span>
                </div>
              )}
              {company.updated_at && (
                <div className="detail-row">
                  <span className="detail-label">Updated At</span>
                  <span className="detail-value">{formatDate(company.updated_at)}</span>
                </div>
              )}
              {company.source_id && (
                <div className="detail-row">
                  <span className="detail-label">Source ID</span>
                  <span className="detail-value">{company.source_id}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyInfo;
