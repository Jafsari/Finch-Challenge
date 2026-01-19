import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WhatsChanged(props) {
  var loading = props.loading;
  var error = props.error;
  var syncTimes = props.syncTimes || {};
  var [webhookEvents, setWebhookEvents] = useState([]);
  var [filterType, setFilterType] = useState('all');

  useEffect(function() {
    axios.get("http://localhost:4000/webhooks/changes")
      .then(function(res) {
        console.log("[WhatsChanged] Webhook events response:", res.data);
        var events = res.data.events || res.data || [];
        console.log("[WhatsChanged] Parsed events:", events, "Count:", events.length);
        if (Array.isArray(events)) {
          setWebhookEvents(events);
        } else {
          console.warn("[WhatsChanged] Events is not an array:", events);
          setWebhookEvents([]);
        }
      })
      .catch(function(err) {
        console.error("Error fetching webhook events:", err);
        console.error("Error details:", err.response?.data || err.message);
        setWebhookEvents([]);
      });
  }, []);

  function formatEventType(eventType) {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
  }

  function getEventIcon(eventType) {
    if (eventType.includes('created')) return '➕';
    if (eventType.includes('updated')) return '✏️';
    if (eventType.includes('deleted')) return '🗑️';
    if (eventType.includes('completed')) return '✓';
    if (eventType.includes('account')) return '🔐';
    return '📋';
  }

  function getEventColor(eventType) {
    if (eventType.includes('created')) return '#10b981';
    if (eventType.includes('updated')) return '#3b82f6';
    if (eventType.includes('deleted')) return '#ef4444';
    if (eventType.includes('completed')) return '#8b5cf6';
    if (eventType.includes('account')) return '#f59e0b';
    return '#6b7280';
  }

  function formatTimestamp(timestamp) {
    // Webhooks don't have timestamp in the payload, we'll use current time minus index
    return 'Just now';
  }

  function getEventDescription(event) {
    var eventType = event.event_type || '';
    var data = event.data || {};
    
    if (eventType === 'directory.created') {
      return 'New employee added to directory';
    }
    if (eventType === 'directory.updated') {
      return 'Employee directory information updated';
    }
    if (eventType === 'employment.created') {
      return 'New employment record created';
    }
    if (eventType === 'employment.updated') {
      return 'Employment information updated';
    }
    if (eventType === 'individual.updated') {
      return 'Individual employee information updated';
    }
    if (eventType === 'payment.created') {
      return 'New payment created for pay date: ' + (data.pay_date || 'N/A');
    }
    if (eventType === 'pay_statement.created') {
      return 'New pay statement created';
    }
    if (eventType === 'job.data_sync_all.completed') {
      return 'Data sync job completed successfully';
    }
    if (eventType === 'account.updated') {
      return 'Account connection updated - Status: ' + (data.status || 'N/A');
    }
    return 'Webhook event received';
  }

  var filteredEvents = webhookEvents.filter(function(event) {
    if (filterType === 'all') return true;
    if (filterType === 'directory') return event.event_type && event.event_type.includes('directory');
    if (filterType === 'employment') return event.event_type && event.event_type.includes('employment');
    if (filterType === 'individual') return event.event_type && event.event_type.includes('individual');
    if (filterType === 'payroll') return event.event_type && (event.event_type.includes('payment') || event.event_type.includes('pay_statement'));
    if (filterType === 'account') return event.event_type && event.event_type.includes('account');
    if (filterType === 'job') return event.event_type && event.event_type.includes('job');
    return true;
  });

  var eventCounts = {
    all: webhookEvents.length,
    directory: webhookEvents.filter(function(e) { return e.event_type && e.event_type.includes('directory'); }).length,
    employment: webhookEvents.filter(function(e) { return e.event_type && e.event_type.includes('employment'); }).length,
    individual: webhookEvents.filter(function(e) { return e.event_type && e.event_type.includes('individual'); }).length,
    payroll: webhookEvents.filter(function(e) { return e.event_type && (e.event_type.includes('payment') || e.event_type.includes('pay_statement')); }).length,
    account: webhookEvents.filter(function(e) { return e.event_type && e.event_type.includes('account'); }).length,
    job: webhookEvents.filter(function(e) { return e.event_type && e.event_type.includes('job'); }).length
  };

  var lastSyncTime = syncTimes.organization || syncTimes.company || null;

  if (loading) {
    return <div className="info-card"><p>Loading webhook events...</p></div>;
  }

  if (error) {
    return <div className="info-card"><p>Error loading webhook events: {error.message}</p></div>;
  }

  return (
    <div className="whats-changed-container">
      <div className="whats-changed-header">
        <h2>What's Changed</h2>
        <p>Webhook events since last data sync</p>
        {lastSyncTime && (
          <div className="last-sync-info">
            <span className="sync-label">Last Sync:</span>
            <span className="sync-time">{lastSyncTime ? new Date(lastSyncTime).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}</span>
          </div>
        )}
      </div>

      <div className="webhook-filters">
        <button 
          className={filterType === 'all' ? 'active' : ''}
          onClick={function() { setFilterType('all'); }}
        >
          All ({eventCounts.all})
        </button>
        <button 
          className={filterType === 'directory' ? 'active' : ''}
          onClick={function() { setFilterType('directory'); }}
        >
          Directory ({eventCounts.directory})
        </button>
        <button 
          className={filterType === 'employment' ? 'active' : ''}
          onClick={function() { setFilterType('employment'); }}
        >
          Employment ({eventCounts.employment})
        </button>
        <button 
          className={filterType === 'individual' ? 'active' : ''}
          onClick={function() { setFilterType('individual'); }}
        >
          Individual ({eventCounts.individual})
        </button>
        <button 
          className={filterType === 'payroll' ? 'active' : ''}
          onClick={function() { setFilterType('payroll'); }}
        >
          Payroll ({eventCounts.payroll})
        </button>
        <button 
          className={filterType === 'account' ? 'active' : ''}
          onClick={function() { setFilterType('account'); }}
        >
          Account ({eventCounts.account})
        </button>
        <button 
          className={filterType === 'job' ? 'active' : ''}
          onClick={function() { setFilterType('job'); }}
        >
          Jobs ({eventCounts.job})
        </button>
      </div>

      {webhookEvents.length === 0 ? (
        <div className="no-events-message">
          <p>No webhook events found. Events will appear here after data sync.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events-message">
          <p>No webhook events found for the selected filter.</p>
        </div>
      ) : (
        <div className="webhook-events-list">
          {filteredEvents.map(function(event, index) {
            var eventColor = getEventColor(event.event_type);
            var eventIcon = getEventIcon(event.event_type);
            
            return (
              <div key={(event.entity_id || '') + (event.event_type || '') + index} className="webhook-event-card">
                <div className="event-header">
                  <div className="event-icon" style={{ color: eventColor }}>
                    {eventIcon}
                  </div>
                  <div className="event-info">
                    <div className="event-type">{formatEventType(event.event_type || 'unknown')}</div>
                    <div className="event-timestamp">Since last sync</div>
                  </div>
                  <div className="event-badge" style={{ backgroundColor: eventColor + '20', color: eventColor }}>
                    {formatEventType(event.event_type || 'unknown')}
                  </div>
                </div>
                <div className="event-body">
                  <div className="event-description">
                    {getEventDescription(event)}
                  </div>
                  {event.data && (
                    <div className="event-data">
                      {event.data.individual_id && (
                        <div className="data-item">
                          <span className="data-label">Individual ID:</span>
                          <span className="data-value">{event.data.individual_id}</span>
                        </div>
                      )}
                      {event.data.payment_id && (
                        <div className="data-item">
                          <span className="data-label">Payment ID:</span>
                          <span className="data-value">{event.data.payment_id}</span>
                        </div>
                      )}
                      {event.data.pay_date && (
                        <div className="data-item">
                          <span className="data-label">Pay Date:</span>
                          <span className="data-value">{event.data.pay_date}</span>
                        </div>
                      )}
                      {event.data.job_id && (
                        <div className="data-item">
                          <span className="data-label">Job ID:</span>
                          <span className="data-value">{event.data.job_id}</span>
                        </div>
                      )}
                      {event.data.status && (
                        <div className="data-item">
                          <span className="data-label">Status:</span>
                          <span className="data-value">{event.data.status}</span>
                        </div>
                      )}
                      {event.data.authentication_method && (
                        <div className="data-item">
                          <span className="data-label">Authentication Method:</span>
                          <span className="data-value">{event.data.authentication_method}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="event-metadata-section">
                    {event.entity_id && (
                      <div className="event-metadata">
                        <span className="metadata-label">Entity ID:</span>
                        <span className="metadata-value">{event.entity_id}</span>
                      </div>
                    )}
                    {event.connection_id && (
                      <div className="event-metadata">
                        <span className="metadata-label">Connection ID:</span>
                        <span className="metadata-value">{event.connection_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WhatsChanged;
