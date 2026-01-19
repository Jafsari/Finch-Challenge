import React from 'react';
import EmployeeDirectory from './EmployeeDirectory';
import EmployeeDetails from './EmployeeDetails';

// Employee section with directory and details side by side
function EmployeeSection(props) {
  var employees = props.employees;
  var selectedEmployee = props.selectedEmployee;
  var onEmployeeClick = props.onEmployeeClick;
  var loading = props.loading || false;
  
  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="employee-section">
      <EmployeeDirectory 
        employees={employees} 
        onEmployeeClick={onEmployeeClick} 
      />
      <EmployeeDetails selectedEmployee={selectedEmployee} loading={loading} />
    </div>
  );
}

export default EmployeeSection;
