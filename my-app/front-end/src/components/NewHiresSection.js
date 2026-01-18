import React from 'react';

function NewHiresSection(props) {
  var newHires = props.newHires || [];

  return (
    <div className="new-hires-section">
      <h3>New Hires (Last 90 Days)</h3>
      {newHires.length === 0 ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No new hires in the last 90 days.</p>
      ) : (
        <div className="new-hires-list">
          {newHires.map(function(hire, index) {
            return (
              <div key={hire.id || index} className="new-hire-card">
                <div className="hire-info">
                  <h4>{hire.first_name} {hire.last_name}</h4>
                  {hire.title && (
                    <p><strong>Title:</strong> {hire.title}</p>
                  )}
                  {hire.department && (
                    <p><strong>Department:</strong> {hire.department}</p>
                  )}
                  {hire.email && (
                    <p><strong>Email:</strong> {hire.email}</p>
                  )}
                  {hire.start_date && (
                    <p><strong>Start Date:</strong> {new Date(hire.start_date).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="hire-actions">
                  <button className="action-button primary">Invite to Join</button>
                  <button className="action-button secondary">Assign Role</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NewHiresSection;
