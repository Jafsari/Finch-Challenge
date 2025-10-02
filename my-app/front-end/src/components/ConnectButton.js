import React from 'react';

// Connect button for Finch Connect
function ConnectButton(props) {
  var onConnect = props.onConnect;
  
  return (
    <button className="connect-btn" onClick={onConnect}>
      Connect to HR Provider
    </button>
  );
}

export default ConnectButton;
