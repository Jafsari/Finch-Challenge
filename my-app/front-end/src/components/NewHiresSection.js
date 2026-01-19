import React, { useState } from 'react';

function NewHiresSection(props) {
  var newHires = props.newHires || [];
  var [onboardingStatus, setOnboardingStatus] = useState({});
  var [processingInvites, setProcessingInvites] = useState({});

  function handleSendInvite(hireId, hireName) {
    // Set processing state
    setProcessingInvites(function(prev) {
      var newState = { ...prev };
      newState[hireId] = true;
      return newState;
    });

    // Initialize onboarding status
    setOnboardingStatus(function(prev) {
      var newState = { ...prev };
      newState[hireId] = {
        status: 'invited',
        invitedDate: new Date().toISOString(),
        steps: {
          invite_sent: { completed: true, completedAt: new Date().toISOString() },
          welcome_email: { completed: false, completedAt: null },
          account_setup: { completed: false, completedAt: null },
          benefits_enrollment: { completed: false, completedAt: null },
          equipment_assigned: { completed: false, completedAt: null },
          first_day_prep: { completed: false, completedAt: null }
        }
      };
      return newState;
    });

    // Simulate onboarding process with delays
    setTimeout(function() {
      setProcessingInvites(function(prev) {
        var newState = { ...prev };
        delete newState[hireId];
        return newState;
      });

      // Auto-complete welcome email step
      setTimeout(function() {
        setOnboardingStatus(function(prev) {
          var newState = { ...prev };
          if (newState[hireId]) {
            newState[hireId].steps.welcome_email.completed = true;
            newState[hireId].steps.welcome_email.completedAt = new Date().toISOString();
          }
          return newState;
        });
      }, 2000);

      // Auto-complete account setup
      setTimeout(function() {
        setOnboardingStatus(function(prev) {
          var newState = { ...prev };
          if (newState[hireId]) {
            newState[hireId].steps.account_setup.completed = true;
            newState[hireId].steps.account_setup.completedAt = new Date().toISOString();
          }
          return newState;
        });
      }, 4000);

      // Show success alert
      alert('✓ Invitation sent to ' + hireName + '!\n\nOnboarding process initiated:\n- Invite sent\n- Welcome email will be sent\n- Account setup in progress\n- Benefits enrollment pending\n- Equipment assignment scheduled');
    }, 1500);
  }

  function handleAssignRole(hireId, hireName) {
    alert('Role assignment for ' + hireName + ' would be configured here.\n\nThis would allow you to assign specific roles, permissions, and access levels based on their title and department.');
  }

  return (
    <div className="new-hires-section">
      <h3>New Hires (Last 90 Days)</h3>
      {newHires.length === 0 ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No new hires in the last 90 days.</p>
      ) : (
        <div className="new-hires-list">
          {newHires.map(function(hire, index) {
            var hireId = hire.id || index;
            var isProcessing = processingInvites[hireId];
            var onboarding = onboardingStatus[hireId];
            var completedSteps = onboarding ? Object.values(onboarding.steps).filter(function(step) { return step.completed; }).length : 0;
            var totalSteps = onboarding ? Object.keys(onboarding.steps).length : 0;

            return (
              <div key={hireId} className={"new-hire-card" + (onboarding ? " onboarding-active" : "")}>
                <div className="hire-info">
                  <h4>
                    {hire.first_name} {hire.last_name}
                    {onboarding && (
                      <span className="onboarding-badge">Onboarding</span>
                    )}
                  </h4>
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
                  
                  {/* Onboarding Progress */}
                  {onboarding && (
                    <div className="onboarding-progress">
                      <div className="progress-header">
                        <span className="progress-label">Onboarding Progress</span>
                        <span className="progress-percentage">{Math.round((completedSteps / totalSteps) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: (completedSteps / totalSteps) * 100 + '%'}}
                        ></div>
                      </div>
                      <div className="onboarding-steps">
                        {Object.entries(onboarding.steps).map(function([stepKey, step]) {
                          var stepName = stepKey.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                          return (
                            <div key={stepKey} className={"onboarding-step" + (step.completed ? " completed" : "")}>
                              <span className="step-icon">{step.completed ? '✓' : '○'}</span>
                              <span className="step-name">{stepName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="hire-actions">
                  {onboarding ? (
                    <button className="action-button success" disabled>
                      ✓ Invite Sent
                    </button>
                  ) : isProcessing ? (
                    <button className="action-button processing" disabled>
                      <span className="processing-spinner"></span>
                      Sending...
                    </button>
                  ) : (
                    <button 
                      className="action-button primary"
                      onClick={function() {
                        handleSendInvite(hireId, (hire.first_name || '') + ' ' + (hire.last_name || ''));
                      }}
                    >
                      Send Invite
                    </button>
                  )}
                  <button 
                    className="action-button secondary"
                    onClick={function() {
                      handleAssignRole(hireId, (hire.first_name || '') + ' ' + (hire.last_name || ''));
                    }}
                  >
                    Assign Role
                  </button>
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
