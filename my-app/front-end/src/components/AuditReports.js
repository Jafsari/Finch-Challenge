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
      <h2>Audit & Compliance Reports</h2>
      <div className="audit-summary">
        <div className="audit-summary-item">
          <span className="audit-label">Total Events</span>
          <span className="audit-value">{auditLogs.length}</span>
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
