import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Organizational Chart component with hierarchical visualization
function OrgChart(props) {
  var loading = props.loading;
  var error = props.error;
  
  var [orgChartData, setOrgChartData] = useState([]);
  var [isLoading, setIsLoading] = useState(false);
  var [orgError, setOrgError] = useState(null);

  // Fetch org chart data
  useEffect(function() {
    setIsLoading(true);
    setOrgError(null);
    
    axios.get("http://localhost:4000/org-chart")
      .then(function(res) {
        var employees = res.data.employees || res.data || [];
        setOrgChartData(employees);
        setIsLoading(false);
      })
      .catch(function(err) {
        const errorMessage = err.response?.data?.error || "Failed to fetch organizational chart data";
        setOrgError({
          message: errorMessage,
          details: err.response?.data
        });
        setIsLoading(false);
      });
  }, []);

  // Build hierarchical structure
  function buildHierarchy(employees) {
    var employeeMap = {};
    var rootEmployees = [];
    
    // Create map of all employees
    employees.forEach(function(emp) {
      employeeMap[emp.id] = {
        ...emp,
        reports: []
      };
    });
    
    // Build tree structure
    employees.forEach(function(emp) {
      if (emp.manager_id && employeeMap[emp.manager_id]) {
        employeeMap[emp.manager_id].reports.push(employeeMap[emp.id]);
      } else {
        rootEmployees.push(employeeMap[emp.id]);
      }
    });
    
    // If no root employees found, return all employees at root level
    if (rootEmployees.length === 0) {
      return employees.map(function(emp) {
        return {
          ...emp,
          reports: []
        };
      });
    }
    
    return rootEmployees;
  }

  // Render employee node recursively
  function renderEmployeeNode(employee, level) {
    var hasReports = employee.reports && employee.reports.length > 0;
    var nodeStyle = {
      margin: '1rem',
      padding: '1rem',
      backgroundColor: level === 0 ? '#3b82f6' : level === 1 ? '#10b981' : '#6b7280',
      color: 'white',
      borderRadius: '8px',
      minWidth: '200px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    
    return (
      <div key={employee.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={nodeStyle}>
          <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
            {employee.first_name} {employee.last_name}
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.9, marginBottom: '0.25rem' }}>
            {employee.title}
          </div>
          {employee.department && employee.department !== 'N/A' && (
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {employee.department}
            </div>
          )}
        </div>
        
        {hasReports && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '2px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            position: 'relative'
          }}>
            {employee.reports.map(function(report) {
              return renderEmployeeNode(report, level + 1);
            })}
          </div>
        )}
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
        Loading organizational chart...
      </div>
    );
  }

  if (orgError || error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <strong>Error:</strong> {(orgError || error).message}
      </div>
    );
  }

  var hierarchy = buildHierarchy(orgChartData);

  if (hierarchy.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
        No organizational chart data available.
      </div>
    );
  }

  return (
    <div id="org-chart" className="org-chart-section">
      <div className="info-card">
        <h2>Organizational Chart</h2>
        <div className="info-card-content">
          <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.9375rem' }}>
            Visual representation of your organization's reporting structure.
          </p>

          <div style={{
            padding: '2rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflowX: 'auto',
            minHeight: '400px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem'
            }}>
              {hierarchy.map(function(employee) {
                return renderEmployeeNode(employee, 0);
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
              <span>Top Level</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
              <span>Second Level</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#6b7280', borderRadius: '4px' }}></div>
              <span>Individual Contributors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrgChart;
