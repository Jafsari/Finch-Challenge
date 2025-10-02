import React from 'react';

// Employee list
function EmployeeDirectory(props) {
  var employees = props.employees;
  var onEmployeeClick = props.onEmployeeClick;
  
  if (!employees || employees.length === 0) {
    return null;
  }

  var employeeList = employees.map(function(emp) {
    return (
      <li key={emp.id}>
        <button
          className="employee-btn"
          onClick={function() { onEmployeeClick(emp.id); }}
        >
          {emp.first_name} {emp.last_name}
        </button>
      </li>
    );
  });

  return (
    <div className="employee-list">
      <h2>Employee Directory</h2>
      <ul>
        {employeeList}
      </ul>
    </div>
  );
}

export default EmployeeDirectory;
