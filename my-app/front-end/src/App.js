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
  
  var company = companyState[0];
  var setCompany = companyState[1];
  var employees = employeesState[0];
  var setEmployees = employeesState[1];
  var selectedEmployee = selectedEmployeeState[0];
  var setSelectedEmployee = selectedEmployeeState[1];
  
  // Debounce timer ref
  var debounceTimer = useRef(null);

  // Fetch data after Finch Connect completes
  function fetchAfterConnect() {
    return new Promise(function(resolve, reject) {
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
          
          resolve();
        })
        .catch(function(err) {
          alert("Failed to fetch company or employee data");
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
        alert("Failed to start Finch Connect");
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
          alert("Failed to fetch employee data");
        });
    }, 300); // 300ms delay
  }

  // Render app
  var shouldShowConnectButton = !company && employees.length === 0;
  
  return (
    <div className="app-container">
      <Header company={company} />

      <main className="main-content">
        {/* Show connect button when no data loaded yet */}
        {shouldShowConnectButton && (
          <ConnectButton onConnect={connectFinchReal} />
        )}

        {/* Show company info after connection */}
        <CompanyInfo company={company} />

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
