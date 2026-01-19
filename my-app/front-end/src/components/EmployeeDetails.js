import React from 'react';

// Employee details display
function EmployeeDetails(props) {
  var selectedEmployee = props.selectedEmployee;
  var loading = props.loading || false;
  
  if (loading && !selectedEmployee) {
    return (
      <div className="data-loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading employee information...</p>
      </div>
    );
  }
  
  // Helper function to format income amount
  function formatCurrencyAmount(amount, unit, currency) {
    if (!amount) return 'N/A';
    var formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100); // Assuming amount is in cents
    return unit ? formatted + ' (' + unit + ')' : formatted;
  }

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }
  
  var employeeContent;
  if (selectedEmployee) {
    var individual = selectedEmployee.individual;
    var employment = selectedEmployee.employment;
    
    var fullName = [individual.first_name, employment.middle_name, individual.last_name].filter(Boolean).join(' ');
    
    employeeContent = (
      <React.Fragment>
        {/* Employee Header Card */}
        <div className="employee-header-card">
          <div className="employee-header-main">
            <h2 className="employee-name">{fullName}</h2>
            <p className="employee-title">{employment.job_title || 'N/A'}</p>
          </div>
          <div className="employee-header-meta">
            <div className="status-badge" data-active={employment.is_active}>
              {employment.is_active ? 'Active' : 'Inactive'}
            </div>
            <div className="header-info-item">
              <span className="header-label">Employment Status</span>
              <span className="header-value">{employment.employment_status || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          <div className="details-column">
            {/* Basic Information */}
            <div className="details-card">
              <h4>Basic Information</h4>
              <table className="employee-table">
                <tbody>
                  <tr>
                    <td>Full Name</td>
                    <td>{fullName}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{individual.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Job Title</td>
                    <td>{employment.job_title || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Department</td>
                    <td>{employment.department || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Employee ID</td>
                    <td>{employment.id || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Employment Details */}
            <div className="details-card">
              <h4>Employment Details</h4>
              <table className="employee-table">
                <tbody>
                  <tr>
                    <td>Employment Type</td>
                    <td>{employment.employment_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Employment Status</td>
                    <td>{employment.employment_status || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Start Date</td>
                    <td>{formatDate(employment.start_date)}</td>
                  </tr>
                  <tr>
                    <td>End Date</td>
                    <td>{employment.end_date ? formatDate(employment.end_date) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Latest Rehire Date</td>
                    <td>{employment.latest_rehire_date ? formatDate(employment.latest_rehire_date) : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Class Code</td>
                    <td>{employment.class_code || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Manager ID</td>
                    <td>{employment.manager_id || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Location */}
            {employment.location && (
              <div className="details-card">
                <h4>Location</h4>
                <table className="employee-table">
                  <tbody>
                    {employment.location_line1 && (
                      <tr>
                        <td>Address Line 1</td>
                        <td>{employment.location_line1}</td>
                      </tr>
                    )}
                    {employment.location_line2 && (
                      <tr>
                        <td>Address Line 2</td>
                        <td>{employment.location_line2}</td>
                      </tr>
                    )}
                    {employment.location_city && (
                      <tr>
                        <td>City</td>
                        <td>{employment.location_city}</td>
                      </tr>
                    )}
                    {employment.location_state && (
                      <tr>
                        <td>State</td>
                        <td>{employment.location_state}</td>
                      </tr>
                    )}
                    {employment.location_postal_code && (
                      <tr>
                        <td>Postal Code</td>
                        <td>{employment.location_postal_code}</td>
                      </tr>
                    )}
                    {employment.location_country && (
                      <tr>
                        <td>Country</td>
                        <td>{employment.location_country}</td>
                      </tr>
                    )}
                    {!employment.location_line1 && !employment.location_city && (
                      <tr>
                        <td>Address</td>
                        <td>{employment.location || 'N/A'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="details-column">
            {/* Income Information */}
            {employment.income_amount && (
              <div className="details-card">
                <h4>Income Information</h4>
                <table className="employee-table">
                  <tbody>
                    <tr>
                      <td>Current Income</td>
                      <td className="income-value">
                        {formatCurrencyAmount(employment.income_amount, employment.income_unit, employment.income_currency)}
                      </td>
                    </tr>
                    <tr>
                      <td>Income Format</td>
                      <td>{employment.income || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Effective Date</td>
                      <td>{employment.income_effective_date ? formatDate(employment.income_effective_date) : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Income History */}
            {employment.income_history && employment.income_history.length > 0 && (
              <div className="details-card">
                <h4>Income History</h4>
                <table className="employee-table">
                  <thead>
                    <tr>
                      <td>Date</td>
                      <td>Amount</td>
                    </tr>
                  </thead>
                  <tbody>
                    {employment.income_history.map(function(income, index) {
                      return (
                        <tr key={index}>
                          <td className="income-history">{formatDate(income.effective_date)}</td>
                          <td className="income-value">
                            {formatCurrencyAmount(income.amount, income.unit, income.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Custom Fields */}
            {employment.custom_fields && employment.custom_fields.length > 0 && (
              <div className="details-card">
                <h4>Custom Fields</h4>
                <table className="employee-table">
                  <tbody>
                    {employment.custom_fields.map(function(field, index) {
                      return (
                        <tr key={index}>
                          <td>{field.name || 'Field ' + (index + 1)}</td>
                          <td>{field.value || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Additional Information */}
            <div className="details-card">
              <h4>Additional Information</h4>
              <table className="employee-table">
                <tbody>
                  {employment.source_id && (
                    <tr>
                      <td>Source ID</td>
                      <td>{employment.source_id}</td>
                    </tr>
                  )}
                  {employment.work_id && (
                    <tr>
                      <td>Work ID</td>
                      <td>{employment.work_id}</td>
                    </tr>
                  )}
                  {employment.department_parent && (
                    <tr>
                      <td>Department Parent</td>
                      <td>{employment.department_parent}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  } else {
    employeeContent = (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem', 
        color: '#64748b',
        fontStyle: 'italic'
      }}>
        Select an employee to view their details
      </div>
    );
  }
  
  return (
    <div className="employee-details">
      <div className="employee-details-content">
        {employeeContent}
      </div>
    </div>
  );
}

export default EmployeeDetails;
