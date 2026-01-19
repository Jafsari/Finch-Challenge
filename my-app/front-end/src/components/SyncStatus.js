import React from 'react';

function SyncStatus(props) {
  var syncTimes = props.syncTimes || {};
  var activeRoute = props.activeRoute || 'organization';

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

  function getCurrentRouteSyncTime() {
    switch (activeRoute) {
      case 'organization':
        return syncTimes.organization || syncTimes.company || syncTimes.directory;
      case 'payroll':
        return syncTimes.payroll || syncTimes.payStatements;
      case 'deductions':
        return syncTimes.deductions;
      case 'documents':
        return syncTimes.documents;
      case 'workforce':
        return syncTimes.workforce || syncTimes.newHires || syncTimes.terminated;
      case 'eligibility':
        return syncTimes.eligibility;
      case 'orgchart':
        return syncTimes.orgchart;
      case 'analytics':
        return syncTimes.analytics;
      case 'audit':
        return syncTimes.audit;
      default:
        return null;
    }
  }

  var syncData = [
    { label: 'Organization', time: syncTimes.organization || syncTimes.company || syncTimes.directory, route: 'organization' },
    { label: 'Payroll', time: syncTimes.payroll || syncTimes.payStatements, route: 'payroll' },
    { label: 'Deductions', time: syncTimes.deductions, route: 'deductions' },
    { label: 'Documents', time: syncTimes.documents, route: 'documents' },
    { label: 'Workforce', time: syncTimes.workforce || syncTimes.newHires || syncTimes.terminated, route: 'workforce' },
    { label: 'Eligibility', time: syncTimes.eligibility, route: 'eligibility' },
    { label: 'Org Chart', time: syncTimes.orgchart, route: 'orgchart' },
    { label: 'Analytics', time: syncTimes.analytics, route: 'analytics' },
    { label: 'Audit', time: syncTimes.audit, route: 'audit' }
  ];

  var currentSyncTime = getCurrentRouteSyncTime();

  return (
    <div className="sync-status-container">
      <div className="sync-status-header">
        <h3>Sync Status</h3>
        <p>Last sync times across all data categories</p>
      </div>
      <div className="sync-status-grid">
        {syncData.map(function(item, index) {
          var isActive = item.route === activeRoute;
          var isSynced = !!item.time;
          return (
            <div key={index} className={"sync-item" + (isActive ? ' active' : '')}>
              <div className={isSynced ? 'sync-dot synced' : 'sync-dot never-synced'}></div>
              <div className="sync-label">{item.label}</div>
              <div className="sync-value">{formatSyncTime(item.time)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SyncStatus;
