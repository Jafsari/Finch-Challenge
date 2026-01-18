import React from 'react';
import EmployeeDirectory from './EmployeeDirectory';
import EmployeeDeductions from './EmployeeDeductions';

function DeductionsInfo(props) {
  var employees = props.employees || [];
  var selectedDeductionsEmployee = props.selectedDeductionsEmployee;
  var employeeDeductions = props.employeeDeductions || [];
  var eligibilityData = props.eligibilityData || null;
  var retirement401k = props.retirement401k || null;
  var onEmployeeClick = props.onEmployeeClick;
  var loading = props.loading;
  var error = props.error;

  if (loading && employees.length === 0) {
    return <div className="info-card"><p>Loading deductions information...</p></div>;
  }

  if (error && employees.length === 0) {
    return <div className="info-card"><p>Error loading deductions data: {error.message}</p></div>;
  }

  return (
    <div id="deductions" className="deductions-section">
      <div className="info-card">
        <h2>Deductions Information</h2>
        <div className="info-card-content">
          {employees.length > 0 ? (
            <div className="deductions-layout">
              <div className="employee-list-container">
                <EmployeeDirectory 
                  employees={employees}
                  onEmployeeClick={onEmployeeClick}
                />
              </div>
              {selectedDeductionsEmployee && (
                <div className="employee-deductions-display">
                  <EmployeeDeductions
                    key={selectedDeductionsEmployee.id}
                    employeeId={selectedDeductionsEmployee.id}
                    employeeName={selectedDeductionsEmployee.first_name + ' ' + selectedDeductionsEmployee.last_name}
                    deductions={employeeDeductions}
                    eligibilityData={eligibilityData}
                    retirement401k={retirement401k}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No employees available to view deductions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeductionsInfo;
