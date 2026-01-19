import React, { useState } from 'react';

function EmployeeDeductions(props) {
  var deductions = props.deductions || [];
  var loading = props.loading;
  var employeeName = props.employeeName || 'Employee';
  var eligibilityData = props.eligibilityData || null;
  var retirement401k = props.retirement401k || null;
  var employeeId = props.employeeId;

  var [editingDeferral, setEditingDeferral] = useState(false);
  var [deferralRate, setDeferralRate] = useState('');

  var formatCurrency = function(amount, currency) {
    if (amount === null || amount === undefined) return "";
    var displayAmount = amount / 100; // Always divide by 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(displayAmount);
  };

  if (loading) {
    return (
      <div className="data-loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading deductions...</p>
      </div>
    );
  }

  if (deductions.length === 0) {
    return (
      <div className="employee-deductions-container">
        <h3>Deductions for {employeeName}</h3>
        <p>No deductions found for this employee.</p>
      </div>
    );
  }

  // Find 401k deduction if enrolled
  var retirement401kDeduction = null;
  if (retirement401k && retirement401k.enrolled && deductions.length > 0) {
    retirement401kDeduction = deductions.find(function(deduction) {
      var benefitType = deduction.benefit_type || '';
      return (benefitType === '401k' || benefitType === '401k_roth') &&
             (deduction.benefit_id === retirement401k.benefit_id || deduction.individual_id === employeeId);
    });
  }

  // Mock functions for enrollment and deferral updates
  function handleEnroll401k() {
    alert('Enrollment functionality would be implemented here. This would call the Finch API to enroll the employee in the 401k plan.');
  }

  function handleUpdateDeferral() {
    if (!deferralRate || isNaN(deferralRate) || parseFloat(deferralRate) < 0 || parseFloat(deferralRate) > 100) {
      alert('Please enter a valid deferral rate between 0 and 100%');
      return;
    }
    alert('Update deferral rate functionality would be implemented here. New rate: ' + deferralRate + '%.');
    setEditingDeferral(false);
  }

  return (
    <div className="employee-deductions-container">
      <h3>Deductions for {employeeName}</h3>

      {/* Eligibility Status Section */}
      {eligibilityData && (
        <div className="eligibility-card">
          <h4>Retirement Plan Eligibility</h4>
          <div className="eligibility-content">
            <div className="eligibility-status">
              {eligibilityData.is_eligible ? (
                <span className="badge badge-success">✓ Eligible</span>
              ) : (
                <span className="badge badge-danger">Not Eligible</span>
              )}
            </div>
            <div className="eligibility-details">
              <span className="eligibility-text">
                Days since start: <strong>{eligibilityData.days_since_start || 0}</strong>
              </span>
              {!eligibilityData.is_eligible && eligibilityData.days_until_eligible > 0 && (
                <span className="eligibility-text">
                  ({eligibilityData.days_until_eligible} days until eligible)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 401k Management Section */}
      {retirement401k && retirement401k.benefit_available && (
        <div className="retirement-401k-card">
          <div className="retirement-401k-header">
            <h4>401k Retirement Plan</h4>
            {retirement401k.enrolled && retirement401kDeduction && (
              <div className="current-deferral-info">
                <span className="deferral-label">Current Deferral Rate:</span>
                <span className="deferral-value">
                  {retirement401kDeduction.deduction?.employee_deduction?.type === 'percent'
                    ? retirement401kDeduction.deduction.employee_deduction.amount + '%'
                    : 'N/A'}
                </span>
              </div>
            )}
          </div>
          <div className="retirement-401k-content">
            {retirement401k.enrolled ? (
              <div className="retirement-401k-actions">
                <span className="badge badge-primary">Enrolled</span>
                {!editingDeferral ? (
                  <button onClick={function() { setEditingDeferral(true); }} className="action-button primary">
                    Update Deferral Rate
                  </button>
                ) : (
                  <div className="deferral-update-form">
                    <div className="deferral-input-group">
                      <label htmlFor="deferral-rate">New Deferral Rate (%)</label>
                      <input
                        id="deferral-rate"
                        type="number"
                        value={deferralRate}
                        onChange={function(e) { setDeferralRate(e.target.value); }}
                        placeholder="Enter rate (0-100)"
                        min="0"
                        max="100"
                        step="0.1"
                        className="deferral-input"
                      />
                    </div>
                    <div className="deferral-form-actions">
                      <button onClick={handleUpdateDeferral} className="action-button primary">Save Changes</button>
                      <button onClick={function() { setEditingDeferral(false); setDeferralRate(''); }} className="action-button secondary">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="retirement-401k-actions">
                <span className="badge badge-secondary">Not Enrolled</span>
                {eligibilityData && eligibilityData.is_eligible && (
                  <button onClick={handleEnroll401k} className="action-button primary">
                    Enroll in 401k
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="deductions-list">
        {deductions.map(function(deduction, index) {
          var employeeDeduction = deduction.deduction?.employee_deduction || {};
          var companyContribution = deduction.deduction?.company_contribution || {};

          return (
            <div key={deduction.benefit_id || index} className="deduction-card">
              <div className="deduction-card-header">
                <div className="deduction-header-main">
                  {(deduction.benefit_name || deduction.benefit_type) && (
                    <h4 className="deduction-name">{deduction.benefit_name || deduction.benefit_type}</h4>
                  )}
                  {deduction.benefit_type && (
                    <span className="deduction-type-badge">{deduction.benefit_type}</span>
                  )}
                </div>
              </div>
              <div className="deduction-card-body">
                {(employeeDeduction.amount || companyContribution.amount) && (
                  <div className="deduction-details-grid">
                    {employeeDeduction.amount && (
                      <div className="detail-item">
                        <span className="detail-label">Employee Deduction</span>
                        <span className="detail-value">
                          {employeeDeduction.type === 'percent'
                            ? employeeDeduction.amount + '%'
                            : formatCurrency(employeeDeduction.amount, 'USD')
                          }
                        </span>
                      </div>
                    )}
                    {companyContribution.amount && (
                      <div className="detail-item">
                        <span className="detail-label">Company Contribution</span>
                        <span className="detail-value highlight">
                          {companyContribution.type === 'percent'
                            ? companyContribution.amount + '%'
                            : formatCurrency(companyContribution.amount, 'USD')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeDeductions;
