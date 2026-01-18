import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EligibilityInfo(props) {
  var loading = props.loading;
  var error = props.error;
  var [eligibilityData, setEligibilityData] = useState([]);
  var [filterStatus, setFilterStatus] = useState('all');

  useEffect(function() {
    axios.get("http://localhost:4000/eligibility")
      .then(function(res) {
        setEligibilityData(res.data.employees || res.data || []);
      })
      .catch(function(err) {
        console.error("Error fetching eligibility:", err);
        setEligibilityData([]);
      });
  }, []);

  var filteredData = eligibilityData.filter(function(emp) {
    if (filterStatus === 'eligible') return emp.is_eligible;
    if (filterStatus === 'not-eligible') return !emp.is_eligible;
    return true;
  });

  if (loading) {
    return <div className="info-card"><p>Loading eligibility information...</p></div>;
  }

  if (error) {
    return <div className="info-card"><p>Error loading eligibility: {error.message}</p></div>;
  }

  return (
    <div className="eligibility-container">
      <h2>Employee Eligibility Status</h2>
      <div className="eligibility-filters">
        <button 
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={function() { setFilterStatus('all'); }}
        >
          All
        </button>
        <button 
          className={filterStatus === 'eligible' ? 'active' : ''}
          onClick={function() { setFilterStatus('eligible'); }}
        >
          Eligible
        </button>
        <button 
          className={filterStatus === 'not-eligible' ? 'active' : ''}
          onClick={function() { setFilterStatus('not-eligible'); }}
        >
          Not Eligible
        </button>
      </div>
      <div className="eligibility-table-container">
        <table className="eligibility-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Status</th>
              <th>Days Since Start</th>
              <th>Days Until Eligible</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(function(emp, index) {
              return (
                <tr key={emp.id || index}>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>
                    <span className={"eligibility-badge" + (emp.is_eligible ? ' eligible' : ' not-eligible')}>
                      {emp.is_eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                  <td>{emp.days_since_start || 0}</td>
                  <td>{emp.days_until_eligible || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EligibilityInfo;
