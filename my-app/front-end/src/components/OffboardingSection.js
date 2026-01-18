import React, { useState } from 'react';

function OffboardingSection(props) {
  var terminatedEmployees = props.terminatedEmployees || [];
  var [offboardedEmployees, setOffboardedEmployees] = useState({});
  var [processingEmployees, setProcessingEmployees] = useState({});

  function handleOffboardEmployee(employeeId, employeeName) {
    // Set processing state
    setProcessingEmployees(function(prev) {
      var newState = { ...prev };
      newState[employeeId] = true;
      return newState;
    });

    // Simulate API call delay
    setTimeout(function() {
      // Mark as offboarded
      setOffboardedEmployees(function(prev) {
        var newState = { ...prev };
        newState[employeeId] = true;
        return newState;
      });

      // Remove from processing
      setProcessingEmployees(function(prev) {
        var newState = { ...prev };
        delete newState[employeeId];
        return newState;
      });

      // Show success message
      alert('✓ ' + employeeName + ' has been successfully offboarded.\n\nCompleted tasks:\n- Access revoked\n- Final pay processed\n- Benefits terminated\n- Equipment collected\n- Exit interview completed');
    }, 1500); // 1.5 second delay to simulate API call
  }

  return (
    <div className="offboarding-section">
      <h3>Terminated Employees</h3>
      {terminatedEmployees.length === 0 ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No terminated employees found.</p>
      ) : (
        <div className="terminated-list">
          {terminatedEmployees.map(function(employee, index) {
            var employeeId = employee.id || index;
            var isProcessing = processingEmployees[employeeId];
            var isOffboarded = offboardedEmployees[employeeId];

            return (
              <div 
                key={employeeId} 
                className={"terminated-card" + (isOffboarded ? " offboarded" : "") + (isProcessing ? " processing" : "")}
              >
                <div className="terminated-info">
                  <h4>
                    {employee.first_name} {employee.last_name}
                    {isOffboarded && (
                      <span className="offboarded-badge">✓ Offboarded</span>
                    )}
                  </h4>
                  {employee.title && (
                    <p><strong>Title:</strong> {employee.title}</p>
                  )}
                  {employee.department && (
                    <p><strong>Department:</strong> {employee.department}</p>
                  )}
                  {employee.email && (
                    <p><strong>Email:</strong> {employee.email}</p>
                  )}
                  {employee.end_date && (
                    <p><strong>End Date:</strong> {new Date(employee.end_date).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="terminated-actions">
                  {isOffboarded ? (
                    <button className="action-button success" disabled>
                      ✓ Offboarding Complete
                    </button>
                  ) : isProcessing ? (
                    <button className="action-button processing" disabled>
                      <span className="processing-spinner"></span>
                      Processing...
                    </button>
                  ) : (
                    <button 
                      className="action-button primary"
                      onClick={function() {
                        handleOffboardEmployee(employeeId, (employee.first_name || '') + ' ' + (employee.last_name || ''));
                      }}
                    >
                      Complete Offboarding
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OffboardingSection;
