import React from 'react';

// Employee details display
function EmployeeDetails(props) {
  var selectedEmployee = props.selectedEmployee;
  
  var employeeContent;
  if (selectedEmployee) {
    var individual = selectedEmployee.individual;
    var employment = selectedEmployee.employment;
    
    employeeContent = (
      <React.Fragment>
        <p><strong>Full Name:</strong> {individual.first_name} {individual.last_name}</p>
        <p><strong>Email Address:</strong> {individual.email}</p>
        <p><strong>Job Title:</strong> {employment.job_title}</p>
        <p><strong>Department:</strong> {employment.department}</p>
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
      <h3>Employee Profile</h3>
      {employeeContent}
    </div>
  );
}

export default EmployeeDetails;
