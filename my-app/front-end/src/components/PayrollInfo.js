import React from 'react';
import EmployeeDirectory from './EmployeeDirectory';
import PayStatementHistory from './PayStatementHistory';

function PayrollInfo(props) {
  var employees = props.employees || [];
  var selectedPayrollEmployee = props.selectedPayrollEmployee;
  var payStatements = props.payStatements || [];
  var onEmployeeClick = props.onEmployeeClick;
  var loading = props.loading;
  var error = props.error;

  if (loading && employees.length === 0) {
    return <div className="info-card"><p>Loading payroll information...</p></div>;
  }

  if (error && employees.length === 0) {
    return <div className="info-card"><p>Error loading payroll data: {error.message}</p></div>;
  }

  return (
    <div id="payroll" className="payroll-section">
      <div className="info-card">
        <h2>Payroll Information</h2>
        <div className="info-card-content">
          {employees.length > 0 ? (
            <div className="payroll-layout">
              <div className="employee-list-container">
                <EmployeeDirectory 
                  employees={employees}
                  onEmployeeClick={onEmployeeClick}
                />
              </div>
              {selectedPayrollEmployee && (
                <div className="pay-statement-display">
                  <PayStatementHistory
                    key={selectedPayrollEmployee.id}
                    employeeId={selectedPayrollEmployee.id}
                    employeeName={selectedPayrollEmployee.first_name + ' ' + selectedPayrollEmployee.last_name}
                    payStatements={payStatements}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No employees available to view payroll.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayrollInfo;
