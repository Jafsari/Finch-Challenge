import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuditReports(props) {
  var loading = props.loading;
  var error = props.error;
  var [auditLogs, setAuditLogs] = useState([]);
  var [filterCategory, setFilterCategory] = useState('all');

  useEffect(function() {
    axios.get("http://localhost:4000/audit/compliance")
      .then(function(res) {
        // Backend returns { audit_log: [...], count: ... }
        var logs = res.data.audit_log || res.data.audit_logs || (Array.isArray(res.data) ? res.data : []);
        setAuditLogs(logs);
        console.log("[Audit] Fetched audit logs:", logs.length);
      })
      .catch(function(err) {
        console.error("Error fetching audit logs:", err);
        setAuditLogs([]);
      });
  }, []);

  var filteredLogs = auditLogs.filter(function(log) {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  // Calculate summary statistics
  var eligibilityCount = auditLogs.filter(function(log) { return log.category === 'eligibility'; }).length;
  var enrollmentCount = auditLogs.filter(function(log) { return log.category === 'enrollment'; }).length;
  var deferralCount = auditLogs.filter(function(log) { return log.category === 'deferral'; }).length;
  
  var futureDatedCount = auditLogs.filter(function(log) {
    return isFutureDate(log.effective_date);
  }).length;
  
  var recentCount = auditLogs.filter(function(log) {
    if (!log.action_date) return false;
    var actionDate = new Date(log.action_date);
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return actionDate >= thirtyDaysAgo;
  }).length;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  function isFutureDate(dateString) {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  }

  if (loading) {
    return <div className="info-card"><p>Loading audit reports...</p></div>;
  }

  if (error) {
    return <div className="info-card"><p>Error loading audit: {error.message}</p></div>;
  }

  return (
    <div className="audit-container">
      <div className="audit-header">
        <h2>Audit & Compliance Reports</h2>
        <div className="audit-info-card">
          <div className="audit-use-case-info">
            <h3>Change Log / Audit Trail</h3>
            <p>This comprehensive audit trail tracks all critical changes to your retirement plan administration, providing a complete record of who made what changes and when. This is essential for compliance, recordkeeping, and maintaining transparency in plan management.</p>
            <div className="audit-use-case-details">
              <div className="use-case-item">
                <span className="use-case-icon">📋</span>
                <div>
                  <strong>Eligibility Rule Changes</strong>
                  <p>Tracks modifications to plan eligibility rules, such as waiting periods, part-time eligibility, or other qualification criteria. Shows who changed the rules, when, and the before/after values.</p>
                  <div className="date-calculation-info">
                    <strong>Date Calculation:</strong>
                    <ul>
                      <li><strong>Action Date:</strong> Calculated as a past date (e.g., 45 days ago, 120 days ago) representing when the rule change was made</li>
                      <li><strong>Effective Date:</strong> Same as action date (rule changes take effect immediately)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="use-case-item">
                <span className="use-case-icon">✅</span>
                <div>
                  <strong>Employee Enrollments</strong>
                  <p>Records when employees are enrolled in retirement plans, including who performed the enrollment, the effective date, and the employee details. Critical for tracking participation history.</p>
                  <div className="date-calculation-info">
                    <strong>Date Calculation:</strong>
                    <ul>
                      <li><strong>Action Date:</strong> Calculated as 90 days after the employee's start date (from Finch employment data), set to 9:00 AM or 10:15 AM business hours</li>
                      <li><strong>Effective Date:</strong> Same as action date (enrollments take effect immediately upon enrollment)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="use-case-item">
                <span className="use-case-icon">💰</span>
                <div>
                  <strong>Deferral Rate Changes</strong>
                  <p>Monitors changes to employee contribution rates (deferral percentages), showing the previous and new rates, who made the change, and when it becomes effective. Important for payroll accuracy.</p>
                  <div className="date-calculation-info">
                    <strong>Date Calculation:</strong>
                    <ul>
                      <li><strong>Action Date:</strong> Calculated as a past date (e.g., 10, 20, or 30 days ago depending on employee), set to 2:30 PM</li>
                      <li><strong>Effective Date:</strong> Calculated as 7 days after the action date (deferral changes have a 7-day processing period before taking effect)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="use-case-item">
                <span className="use-case-icon">📅</span>
                <div>
                  <strong>Action vs Effective Dates</strong>
                  <p>Distinguishes between when an action was performed (action date) and when it takes effect (effective date). Future-dated changes are clearly marked for planning purposes.</p>
                  <div className="date-calculation-info">
                    <strong>Key Points:</strong>
                    <ul>
                      <li><strong>Action Date:</strong> When the change was made in the system (simulated based on employee data and business logic)</li>
                      <li><strong>Effective Date:</strong> When the change actually takes effect (may be the same day or future-dated)</li>
                      <li><strong>Note:</strong> These dates are calculated based on real employee data from Finch (IDs, names, start dates) but the audit trail itself is simulated for demonstration purposes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="audit-summary">
        <div className="audit-summary-item">
          <span className="audit-label">Total Events</span>
          <span className="audit-value">{auditLogs.length}</span>
        </div>
        <div className="audit-summary-item">
          <span className="audit-label">Eligibility Changes</span>
          <span className="audit-value">{eligibilityCount}</span>
        </div>
        <div className="audit-summary-item">
          <span className="audit-label">Enrollments</span>
          <span className="audit-value">{enrollmentCount}</span>
        </div>
        <div className="audit-summary-item">
          <span className="audit-label">Deferral Changes</span>
          <span className="audit-value">{deferralCount}</span>
        </div>
        <div className="audit-summary-item">
          <span className="audit-label">Recent (30 days)</span>
          <span className="audit-value">{recentCount}</span>
        </div>
        <div className="audit-summary-item">
          <span className="audit-label">Future-Dated</span>
          <span className="audit-value">{futureDatedCount}</span>
        </div>
      </div>
      <div className="audit-filters">
        <button 
          className={filterCategory === 'all' ? 'active' : ''}
          onClick={function() { setFilterCategory('all'); }}
        >
          All
        </button>
        <button 
          className={filterCategory === 'eligibility' ? 'active' : ''}
          onClick={function() { setFilterCategory('eligibility'); }}
        >
          Eligibility Rules
        </button>
        <button 
          className={filterCategory === 'enrollment' ? 'active' : ''}
          onClick={function() { setFilterCategory('enrollment'); }}
        >
          Enrollments
        </button>
        <button 
          className={filterCategory === 'deferral' ? 'active' : ''}
          onClick={function() { setFilterCategory('deferral'); }}
        >
          Deferral Changes
        </button>
      </div>
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Action Date</th>
              <th>Effective Date</th>
              <th>Category</th>
              <th>Action</th>
              <th>Performed By</th>
              <th>Entity</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(function(log, index) {
              return (
                <tr key={log.id || index}>
                  <td>{formatDate(log.action_date)}</td>
                  <td>
                    {formatDate(log.effective_date)}
                    {isFutureDate(log.effective_date) && <span className="future-indicator"> (Future)</span>}
                  </td>
                  <td>
                    <span className={"audit-badge " + log.category}>
                      {log.category || 'N/A'}
                    </span>
                  </td>
                  <td>{log.action_description || log.action_type || 'N/A'}</td>
                  <td>{log.performed_by_name || log.performed_by || 'N/A'}</td>
                  <td>{log.entity_name || log.entity_id || 'N/A'}</td>
                  <td>
                    {log.previous_value && log.new_value ? (
                      <div>{log.previous_value} → {log.new_value}</div>
                    ) : log.changes && Object.keys(log.changes).length > 0 ? (
                      Object.keys(log.changes).map(function(key) {
                        var change = log.changes[key];
                        return <div key={key}>{key}: {change.from} → {change.to}</div>;
                      })
                    ) : (
                      <span className="no-change">No changes</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditReports;
