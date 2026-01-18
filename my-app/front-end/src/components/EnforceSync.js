import React, { useState } from 'react';
import axios from 'axios';

function EnforceSync(props) {
  var loading = props.loading;
  var error = props.error;
  var [syncResult, setSyncResult] = useState(null);
  var [syncing, setSyncing] = useState(false);

  function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    
    axios.post("http://localhost:4000/sync/enqueue")
      .then(function(res) {
        setSyncResult({ success: true, data: res.data });
        setSyncing(false);
      })
      .catch(function(err) {
        setSyncResult({ success: false, error: err.response?.data?.error || 'Sync failed' });
        setSyncing(false);
      });
  }

  return (
    <div className="enforce-sync-container">
      <div className="enforce-sync-card">
        <div className="enforce-sync-header">
          <h2>Enforce Data Sync</h2>
          <p>Trigger a manual data synchronization across all systems</p>
        </div>
        <div className="enforce-sync-body">
          <button 
            className="enforce-sync-button" 
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Trigger Sync'}
          </button>
          
          {syncResult && (
            <div className={"enforce-sync-result" + (syncResult.success ? ' success' : ' error')}>
              {syncResult.success ? (
                <div>
                  <h4>Sync Initiated Successfully</h4>
                  <p>Job ID: {syncResult.data?.job_id || 'N/A'}</p>
                </div>
              ) : (
                <div>
                  <h4>Sync Failed</h4>
                  <p>{syncResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnforceSync;
