import React from 'react';

function SyncStatus(props) {
  var syncTimes = props.syncTimes || {};

  function formatSyncTime(timestamp) {
    if (!timestamp) return 'Never';
    
    var date = new Date(timestamp);

    function formatMilitaryTime(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var hoursStr = hours.toString().padStart(2, '0');
      var minutesStr = minutes.toString().padStart(2, '0');
      return hoursStr + ':' + minutesStr;
    }

    function formatDate(date) {
      var year = date.getFullYear();
      var month = (date.getMonth() + 1).toString().padStart(2, '0');
      var day = date.getDate().toString().padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    return formatDate(date) + ' ' + formatMilitaryTime(date);
  }

  // Get the most recent sync time from all categories
  var allSyncTimes = [
    syncTimes.organization || syncTimes.company || syncTimes.directory,
    syncTimes.payroll || syncTimes.payStatements,
    syncTimes.deductions,
    syncTimes.documents,
    syncTimes.workforce || syncTimes.newHires || syncTimes.terminated,
    syncTimes.eligibility,
    syncTimes.orgchart,
    syncTimes.analytics,
    syncTimes.audit
  ].filter(function(time) { return time !== null && time !== undefined; });

  var latestSyncTime = null;
  if (allSyncTimes.length > 0) {
    latestSyncTime = allSyncTimes.reduce(function(latest, current) {
      return new Date(current) > new Date(latest) ? current : latest;
    });
  }

  var isSynced = !!latestSyncTime;

  return (
    <div className="sync-status-container">
      <div className="sync-status-content">
        <div className="sync-status-indicator">
          <div className={isSynced ? 'sync-dot synced' : 'sync-dot never-synced'}>
            {isSynced && <div className="sync-dot-pulse"></div>}
          </div>
          <div className="sync-status-info">
            <span className="sync-status-label">HRIS synced</span>
            {isSynced && (
              <span className="sync-status-time">{formatSyncTime(latestSyncTime)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyncStatus;
