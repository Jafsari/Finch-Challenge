import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// Components
import Header from "./components/Header";
import ConnectButton from "./components/ConnectButton";
import CompanyInfo from "./components/CompanyInfo";
import EmployeeSection from "./components/EmployeeSection";

// Main app component - handles Finch Connect flow and data display
function MainApp() {
  // App state
  var companyState = useState(null);
  var employeesState = useState([]);
  var selectedEmployeeState = useState(null);
  var loadingState = useState(false);
  var errorState = useState(null);
  
  var company = companyState[0];
  var setCompany = companyState[1];
  var employees = employeesState[0];
  var setEmployees = employeesState[1];
  var selectedEmployee = selectedEmployeeState[0];
  var setSelectedEmployee = selectedEmployeeState[1];
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var error = errorState[0];
  var setError = errorState[1];
  
  // Debounce timer ref
  var debounceTimer = useRef(null);

  // Fetch data after Finch Connect completes
  function fetchAfterConnect() {
    return new Promise(function(resolve, reject) {
      setLoading(true);
      setError(null);
      
      // Get company info
      axios.get("http://localhost:4000/company")
        .then(function(companyRes) {
          setCompany(companyRes.data);
          
          // Get employee list
          return axios.get("http://localhost:4000/directory");
        })
        .then(function(directoryRes) {
          var employeeData;
          if (directoryRes.data.employees) {
            employeeData = directoryRes.data.employees;
          } else {
            employeeData = directoryRes.data;
          }
          setEmployees(employeeData);
          setLoading(false);
          
          resolve();
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch company or employee data";
          setError({
            message: errorMessage,
            type: 'fetch_data',
            canRetry: true
          });
          setLoading(false);
          reject(err);
        });
    });
  }

  // Listen for Finch Connect completion message
  useEffect(function() {
    function onMessage(e) {
      if (e && e.data && e.data.type === "finch:connected") {
        fetchAfterConnect();
      }
    }
    window.addEventListener("message", onMessage);
    return function() {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  // Start Finch Connect flow
  function connectFinchReal() {
    // Create session and get connect URL
    axios.post("http://localhost:4000/create_link_token")
      .then(function(res) {
        var connectUrl = res.data.connect_url;
        
        // Open popup window
        var finchWindow = window.open(connectUrl, "_blank", "width=500,height=700");
        // Popup will postMessage back when done
      })
      .catch(function(err) {
        const errorMessage = err.response?.data?.error || "Failed to start Finch Connect";
        setError({
          message: errorMessage,
          type: 'connect',
          canRetry: true
        });
      });
  }

  // Handle employee selection with debouncing
  function handleEmployeeClick(id) {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(function() {
      axios.get("http://localhost:4000/employee/" + id)
        .then(function(res) {
          setSelectedEmployee(res.data);
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch employee data";
          setError({
            message: errorMessage,
            type: 'employee_details',
            canRetry: false
          });
        });
    }, 300); // 300ms delay
  }

  // Retry function for errors
  function handleRetry() {
    if (error && error.type === 'fetch_data') {
      fetchAfterConnect();
    } else if (error && error.type === 'connect') {
      connectFinchReal();
    }
  }

  // Clear error function
  function clearError() {
    setError(null);
  }

  // Render app
  var shouldShowConnectButton = !company && employees.length === 0;
  
  return (
    <div className="app-container">
      <Header company={company} />

      <main className="main-content">
        {/* Error Display */}
        {error && (
          <div className="error-container">
            <div className="error-card">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h3>Something went wrong</h3>
                <p>{error.message}</p>
                <div className="error-actions">
                  {error.canRetry && (
                    <button className="retry-button" onClick={handleRetry}>
                      Try Again
                    </button>
                  )}
                  <button className="dismiss-button" onClick={clearError}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your data...</p>
          </div>
        )}

        {/* Show connect button when no data loaded yet */}
        {shouldShowConnectButton && !loading && (
          <ConnectButton onConnect={connectFinchReal} />
        )}

        {/* Show company info after connection */}
        <CompanyInfo company={company} loading={loading} error={error} />

        {/* Employee list and details side by side */}
        <EmployeeSection 
          employees={employees}
          selectedEmployee={selectedEmployee}
          onEmployeeClick={handleEmployeeClick}
        />
      </main>
    </div>
  );
}

export default MainApp;
