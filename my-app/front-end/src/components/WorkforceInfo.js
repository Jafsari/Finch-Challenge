import React from 'react';
import NewHiresSection from './NewHiresSection';
import OffboardingSection from './OffboardingSection';

function WorkforceInfo(props) {
  var employees = props.employees || [];
  var newHires = props.newHires || [];
  var terminatedEmployees = props.terminatedEmployees || [];
  var loading = props.loading;
  var error = props.error;

  if (loading) {
    return <div className="info-card"><p>Loading workforce information...</p></div>;
  }

  if (error) {
    return <div className="info-card"><p>Error loading workforce data: {error.message}</p></div>;
  }

  return (
    <div id="workforce" className="workforce-section">
      <div className="info-card">
        <h2>Workforce Management</h2>
        <div className="info-card-content">
          <NewHiresSection newHires={newHires} />
          <OffboardingSection terminatedEmployees={terminatedEmployees} />
        </div>
      </div>
    </div>
  );
}

export default WorkforceInfo;
