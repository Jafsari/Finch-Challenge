import React from 'react';
import './EmployerSelector.css';

function EmployerSelector(props) {
  var selectedEmployer = props.selectedEmployer || 'ramp';
  var onEmployerChange = props.onEmployerChange;
  
  var employers = [
    { id: 'justin-test', name: 'Justin-test' },
    { id: 'ramp', name: 'Ramp' },
    { id: 'deel', name: 'Deel' },
    { id: 'ubiquity', name: 'Ubiquity' }
  ];

  return (
    <div className="employer-selector">
      <label className="employer-selector-label">Employer:</label>
      <div className="employer-toggle-group">
        {employers.map(function(employer) {
          return (
            <button
              key={employer.id}
              className={"employer-toggle-button" + (selectedEmployer === employer.id ? ' active' : '')}
              onClick={function() {
                if (onEmployerChange) {
                  onEmployerChange(employer.id);
                }
              }}
            >
              {employer.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EmployerSelector;
