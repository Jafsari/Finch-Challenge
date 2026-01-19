import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EligibilityInfo(props) {
  var loading = props.loading;
  var error = props.error;
  var [eligibilityData, setEligibilityData] = useState([]);
  var [filterStatus, setFilterStatus] = useState('all');
  var [enrolledEmployees, setEnrolledEmployees] = useState(new Set());
  var [enrollingEmployees, setEnrollingEmployees] = useState(new Set());
  var [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(null);

  useEffect(function() {
    axios.get("http://localhost:4000/eligibility")
      .then(function(res) {
        setEligibilityData(res.data.employees || res.data || []);
      })
      .catch(function(err) {
        console.error("Error fetching eligibility:", err);
        setEligibilityData([]);
      });
  }, []);

  var filteredData = eligibilityData.filter(function(emp) {
    if (filterStatus === 'eligible') return emp.is_eligible;
    if (filterStatus === 'not-eligible') return !emp.is_eligible;
    return true;
  });

  function handleEnrollEmployee(employeeId, employeeName) {
    // Check if already enrolled
    if (enrolledEmployees.has(employeeId)) {
      return;
    }

    // Set enrolling state
    setEnrollingEmployees(function(prev) {
      var newSet = new Set(prev);
      newSet.add(employeeId);
      return newSet;
    });

    // Simulate enrollment API call with delay
    setTimeout(function() {
      // Mark as enrolled
      setEnrolledEmployees(function(prev) {
        var newSet = new Set(prev);
        newSet.add(employeeId);
        return newSet;
      });

      // Remove from enrolling
      setEnrollingEmployees(function(prev) {
        var newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });

      // Show success message
      setShowEnrollmentSuccess({
        employeeId: employeeId,
        employeeName: employeeName
      });

      // Hide success message after 3 seconds
      setTimeout(function() {
        setShowEnrollmentSuccess(null);
      }, 3000);
    }, 1500);
  }

  if (loading) {
    return <div className="info-card"><p>Loading eligibility information...</p></div>;
  }

  if (error) {
    return <div className="info-card"><p>Error loading eligibility: {error.message}</p></div>;
  }

  // Calculate summary statistics
  var eligibleCount = eligibilityData.filter(function(emp) { return emp.is_eligible; }).length;
  var notEligibleCount = eligibilityData.filter(function(emp) { return !emp.is_eligible; }).length;
  var totalCount = eligibilityData.length;
  var eligiblePercentage = totalCount > 0 ? Math.round((eligibleCount / totalCount) * 100) : 0;

  return (
    <div className="eligibility-container">
      <div className="eligibility-header">
        <h2>Employee Eligibility Status</h2>
        <div className="eligibility-info-card">
          <div className="eligibility-rule-info">
            <h3>Eligibility Rule: 90-Day Waiting Period</h3>
            <p>Employees become eligible for retirement plan participation after completing 90 days of service from their start date.</p>
            <div className="eligibility-rule-details">
              <div className="rule-detail-item">
                <span className="rule-icon">✓</span>
                <span><strong>Eligible:</strong> Employees with 90+ days since start date</span>
              </div>
              <div className="rule-detail-item">
                <span className="rule-icon">⏳</span>
                <span><strong>Not Eligible:</strong> Employees with less than 90 days of service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="eligibility-summary">
        <div className="summary-card eligible-summary">
          <div className="summary-number">{eligibleCount}</div>
          <div className="summary-label">Eligible Employees</div>
          <div className="summary-percentage">{eligiblePercentage}%</div>
        </div>
        <div className="summary-card not-eligible-summary">
          <div className="summary-number">{notEligibleCount}</div>
          <div className="summary-label">Not Yet Eligible</div>
          <div className="summary-percentage">{100 - eligiblePercentage}%</div>
        </div>
        <div className="summary-card total-summary">
          <div className="summary-number">{totalCount}</div>
          <div className="summary-label">Total Employees</div>
        </div>
      </div>

      <div className="eligibility-filters">
        <button 
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={function() { setFilterStatus('all'); }}
        >
          All
        </button>
        <button 
          className={filterStatus === 'eligible' ? 'active' : ''}
          onClick={function() { setFilterStatus('eligible'); }}
        >
          Eligible
        </button>
        <button 
          className={filterStatus === 'not-eligible' ? 'active' : ''}
          onClick={function() { setFilterStatus('not-eligible'); }}
        >
          Not Eligible
        </button>
      </div>
      {/* Enrollment Success Message */}
      {showEnrollmentSuccess && (
        <div className="enrollment-success-message">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <strong>Success!</strong> You have enrolled {showEnrollmentSuccess.employeeName} in the retirement plan.
          </div>
        </div>
      )}

      <div className="eligibility-table-container">
        <table className="eligibility-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Title</th>
              <th>Department</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Days Since Start</th>
              <th>Days Until Eligible</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No employees found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredData.map(function(emp, index) {
                var startDateFormatted = emp.start_date ? new Date(emp.start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A';
                
                var employeeId = emp.id || index;
                var employeeName = (emp.first_name || '') + ' ' + (emp.last_name || '');
                var isEnrolled = enrolledEmployees.has(employeeId);
                var isEnrolling = enrollingEmployees.has(employeeId);
                var canEnroll = emp.is_eligible && !isEnrolled && !isEnrolling;
                
                return (
                  <tr key={employeeId}>
                    <td>
                      <strong>{emp.first_name} {emp.last_name}</strong>
                    </td>
                    <td>{emp.title || 'N/A'}</td>
                    <td>{emp.department || 'N/A'}</td>
                    <td>{startDateFormatted}</td>
                    <td>
                      <span className={"eligibility-badge" + (emp.is_eligible ? ' eligible' : ' not-eligible')}>
                        {emp.is_eligible ? '✓ Eligible' : '⏳ Not Eligible'}
                      </span>
                      {isEnrolled && (
                        <span className="enrollment-badge enrolled">Enrolled</span>
                      )}
                    </td>
                    <td>
                      <span className={emp.is_eligible ? 'days-count eligible-days' : 'days-count'}>
                        {emp.days_since_start || 0} days
                      </span>
                    </td>
                    <td>
                      {emp.is_eligible ? (
                        <span className="days-count eligible-days">—</span>
                      ) : (
                        <span className="days-count pending-days">{emp.days_until_eligible || 0} days</span>
                      )}
                    </td>
                    <td>
                      {emp.is_eligible ? (
                        isEnrolled ? (
                          <span className="enrollment-status enrolled-status">
                            <span className="status-icon">✓</span>
                            Enrolled
                          </span>
                        ) : isEnrolling ? (
                          <span className="enrollment-status enrolling-status">
                            <span className="enrolling-spinner"></span>
                            Enrolling...
                          </span>
                        ) : (
                          <button
                            className="enroll-button"
                            onClick={function() {
                              handleEnrollEmployee(employeeId, employeeName);
                            }}
                          >
                            Enroll in Plan
                          </button>
                        )
                      ) : (
                        <span className="enrollment-status not-eligible-status">
                          Not Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EligibilityInfo;
