import React from 'react';
import EmployeeDirectory from './EmployeeDirectory';
import EmployeeDocuments from './EmployeeDocuments';

function DocumentsInfo(props) {
  var employees = props.employees || [];
  var selectedDocumentsEmployee = props.selectedDocumentsEmployee;
  var employeeDocuments = props.employeeDocuments || [];
  var onEmployeeClick = props.onEmployeeClick;
  var loading = props.loading;
  var error = props.error;

  if (loading && employees.length === 0) {
    return <div className="info-card"><p>Loading documents information...</p></div>;
  }

  if (error && employees.length === 0) {
    return <div className="info-card"><p>Error loading documents data: {error.message}</p></div>;
  }

  return (
    <div id="documents" className="documents-section">
      <div className="info-card">
        <h2>Documents Information</h2>
        <div className="info-card-content">
          {employees.length > 0 ? (
            <div className="documents-layout">
              <div className="employee-list-container">
                <EmployeeDirectory 
                  employees={employees}
                  onEmployeeClick={onEmployeeClick}
                />
              </div>
              {selectedDocumentsEmployee && (
                <div className="employee-documents-display">
                  <EmployeeDocuments
                    key={selectedDocumentsEmployee.id}
                    employeeId={selectedDocumentsEmployee.id}
                    employeeName={selectedDocumentsEmployee.first_name + ' ' + selectedDocumentsEmployee.last_name}
                    documents={employeeDocuments}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No employees available to view documents.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentsInfo;
