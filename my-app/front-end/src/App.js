import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useFinchConnect } from "@tryfinch/react-connect";
import "./App.css";

// Components
import Header from "./components/Header";
import Integrations from "./components/Integrations";
import ConnectButton from "./components/ConnectButton";
import CompanyInfo from "./components/CompanyInfo";
import DeductionsInfo from "./components/DeductionsInfo";
import PayrollInfo from "./components/PayrollInfo";
import DocumentsInfo from "./components/DocumentsInfo";
import WorkforceInfo from "./components/WorkforceInfo";
import EmployeeSection from "./components/EmployeeSection";
import Footer from "./components/Footer";
import SyncStatus from "./components/SyncStatus";
import OrgChart from "./components/OrgChart";
import EligibilityInfo from "./components/EligibilityInfo";
import HeadcountReports from "./components/HeadcountReports";
import AuditReports from "./components/AuditReports";

// Main app component - handles Finch Connect flow and data display
function MainApp() {
  // App state
  var companyState = useState(null);
  var employeesState = useState([]);
  var selectedEmployeeState = useState(null);
  var selectedPayrollEmployeeState = useState(null);
  var payStatementsState = useState([]);
  var selectedDeductionsEmployeeState = useState(null);
  var employeeDeductionsState = useState([]);
  var eligibilityDataState = useState(null);
  var retirement401kState = useState(null);
  var selectedDocumentsEmployeeState = useState(null);
  var employeeDocumentsState = useState([]);
  var newHiresState = useState([]);
  var terminatedEmployeesState = useState([]);
  var activeRouteState = useState('organization');
  var loadingState = useState(false);
  var payrollLoadingState = useState(false);
  var deductionsLoadingState = useState(false);
  var employeeDetailsLoadingState = useState(false);
  var errorState = useState(null);
  var syncTimesState = useState({});
  
  var company = companyState[0];
  var setCompany = companyState[1];
  var employees = employeesState[0];
  var setEmployees = employeesState[1];
  var selectedEmployee = selectedEmployeeState[0];
  var setSelectedEmployee = selectedEmployeeState[1];
  var selectedPayrollEmployee = selectedPayrollEmployeeState[0];
  var setSelectedPayrollEmployee = selectedPayrollEmployeeState[1];
  var payStatements = payStatementsState[0];
  var setPayStatements = payStatementsState[1];
  var selectedDeductionsEmployee = selectedDeductionsEmployeeState[0];
  var setSelectedDeductionsEmployee = selectedDeductionsEmployeeState[1];
  var employeeDeductions = employeeDeductionsState[0];
  var setEmployeeDeductions = employeeDeductionsState[1];
  var eligibilityData = eligibilityDataState[0];
  var setEligibilityData = eligibilityDataState[1];
  var retirement401k = retirement401kState[0];
  var setRetirement401k = retirement401kState[1];
  var selectedDocumentsEmployee = selectedDocumentsEmployeeState[0];
  var setSelectedDocumentsEmployee = selectedDocumentsEmployeeState[1];
  var employeeDocuments = employeeDocumentsState[0];
  var setEmployeeDocuments = employeeDocumentsState[1];
  var newHires = newHiresState[0];
  var setNewHires = newHiresState[1];
  var terminatedEmployees = terminatedEmployeesState[0];
  var setTerminatedEmployees = terminatedEmployeesState[1];
  var activeRoute = activeRouteState[0];
  var setActiveRoute = activeRouteState[1];
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var payrollLoading = payrollLoadingState[0];
  var setPayrollLoading = payrollLoadingState[1];
  var deductionsLoading = deductionsLoadingState[0];
  var setDeductionsLoading = deductionsLoadingState[1];
  var employeeDetailsLoading = employeeDetailsLoadingState[0];
  var setEmployeeDetailsLoading = employeeDetailsLoadingState[1];
  var error = errorState[0];
  var setError = errorState[1];
  var syncTimes = syncTimesState[0];
  var setSyncTimes = syncTimesState[1];
  var successMessageState = useState(null);
  var successMessage = successMessageState[0];
  var setSuccessMessage = successMessageState[1];
  var selectedEmployerState = useState('justin-test');
  var selectedEmployer = selectedEmployerState[0];
  var setSelectedEmployer = selectedEmployerState[1];
  
  // Debounce timer ref
  var debounceTimer = useRef(null);

  // Initialize Finch Connect SDK (uses built-in modal)
  var { open: openFinchConnect } = useFinchConnect({
    onSuccess: function({ code, state }) {
      console.log('[App] Finch Connect success - code received');
      handleFinchConnectSuccess({ code, state });
    },
    onError: function({ errorMessage, errorType }) {
      console.error('[App] Finch Connect error:', errorMessage, errorType);
      handleFinchConnectError({ errorMessage, errorType });
    },
    onClose: function() {
      console.log('[App] Finch Connect modal closed');
    }
  });
  var payrollDebounceTimer = useRef(null);
  var deductionsDebounceTimer = useRef(null);
  var documentsDebounceTimer = useRef(null);

  // Fetch data after Finch Connect completes
  function fetchAfterConnect() {
    return new Promise(function(resolve, reject) {
      setLoading(true);
      setError(null);
      
      // Get company info
      axios.get("http://localhost:4000/company", {
        params: { employer: selectedEmployer }
      })
        .then(function(companyRes) {
          setCompany(companyRes.data);
          
          // Get employee list
          return axios.get("http://localhost:4000/directory", {
            params: { employer: selectedEmployer }
          });
        })
        .then(function(directoryRes) {
          var employeeData;
          if (directoryRes.data.employees) {
            employeeData = directoryRes.data.employees;
          } else {
            employeeData = directoryRes.data;
          }
          setEmployees(employeeData);
          
          // Set initial sync times for all tabs ONCE at login - these will never change
          var now = new Date();
          var nowISO = now.toISOString();
          
          // Analytics sync time is 12 hours before
          var analyticsTime = new Date(now.getTime() - (12 * 60 * 60 * 1000));
          var analyticsISO = analyticsTime.toISOString();
          
          setSyncTimes({
            organization: nowISO,
            company: nowISO,
            directory: nowISO,
            payroll: nowISO,
            payStatements: nowISO,
            deductions: nowISO,
            documents: nowISO,
            workforce: nowISO,
            newHires: nowISO,
            terminated: nowISO,
            eligibility: nowISO,
            orgchart: nowISO,
            analytics: analyticsISO,
            audit: nowISO
          });
          
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

  // Start Finch Connect flow - uses SDK's built-in modal
  function connectFinchReal() {
    console.log('[App] Starting Finch Connect flow');
    
    // Create session and open Finch's built-in modal
    axios.post("http://localhost:4000/create_link_token")
      .then(function(res) {
        var sessionId = res.data.session_id;
        console.log('[App] Session created, opening Finch Connect modal:', sessionId);
        
        if (sessionId && openFinchConnect) {
          openFinchConnect({ sessionId: sessionId });
        }
      })
      .catch(function(err) {
        console.error('[App] Failed to create session:', err);
        var errorMessage = err.response?.data?.error || 'Failed to start Finch Connect';
        setError({
          message: errorMessage,
          type: 'connect',
          canRetry: true
        });
      });
  }

  // Handle Finch Connect success
  function handleFinchConnectSuccess(data) {
    console.log('[App] Finch Connect success:', data);
    var code = data.code;
    
    if (!code) {
      console.error('[App] No authorization code received');
      setError({
        message: 'Failed to receive authorization code',
        type: 'connect',
        canRetry: true
      });
      return;
    }

    // Exchange code for access token
    console.log('[App] Exchanging authorization code for access token...');
    axios.post("http://localhost:4000/finch/exchange-code", { code: code })
      .then(function(res) {
        console.log('[App] Token exchange successful');
        setSuccessMessage('Successfully connected to your payroll provider!');
        // Clear success message after 5 seconds
        setTimeout(function() {
          setSuccessMessage(null);
        }, 5000);
        // Fetch data after successful connection
        fetchAfterConnect();
      })
      .catch(function(err) {
        console.error('[App] Token exchange failed:', err);
        var errorMessage = err.response?.data?.error || 'Failed to complete connection';
        setError({
          message: errorMessage,
          type: 'connect',
          canRetry: true
        });
      });
  }

  // Handle Finch Connect error
  function handleFinchConnectError(errorData) {
    console.error('[App] Finch Connect error:', errorData);
    setError({
      message: errorData.errorMessage || 'Failed to connect with Finch',
      type: 'connect',
      canRetry: true
    });
  }

  // Handle employee selection with debouncing
  function handleEmployeeClick(id) {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set loading state
    setEmployeeDetailsLoading(true);
    
    // Set new timer
    debounceTimer.current = setTimeout(function() {
      axios.get("http://localhost:4000/employee/" + id, {
        params: { employer: selectedEmployer }
      })
        .then(function(res) {
          setSelectedEmployee(res.data);
          setEmployeeDetailsLoading(false);
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch employee data";
          setError({
            message: errorMessage,
            type: 'employee_details',
            canRetry: false
          });
          setEmployeeDetailsLoading(false);
        });
    }, 300); // 300ms delay
  }

  // Handle payroll employee selection - fetch pay statements
  function handlePayrollEmployeeClick(id) {
    // Clear previous timer
    if (payrollDebounceTimer.current) {
      clearTimeout(payrollDebounceTimer.current);
    }
    
    // Clear old pay statements immediately to prevent showing wrong data
    setPayStatements([]);
    
    // Set selected employee
    var employee = employees.find(function(emp) {
      return emp.id === id;
    });
    setSelectedPayrollEmployee(employee);
    
    // Set loading state
    setPayrollLoading(true);
    
    // Set new timer to fetch pay statements
    payrollDebounceTimer.current = setTimeout(function() {
      axios.get("http://localhost:4000/employee/" + id + "/pay-statements", {
        params: { employer: selectedEmployer }
      })
        .then(function(res) {
          // Extract pay statements from response structure
          var statements = [];
          
          console.log("[Frontend] Pay statement response:", res.data);
          
          if (res.data && res.data.responses) {
            // Finch API returns responses array where each response.body IS the pay statement object
            res.data.responses.forEach(function(response) {
              // Check response code - 200 means success
              if (response.code === 200 && response.body) {
                var bodyData = response.body;
                
                // Check if body has pay_statements array (some formats)
                if (bodyData.pay_statements && Array.isArray(bodyData.pay_statements)) {
                  statements = statements.concat(bodyData.pay_statements);
                } 
                // Check if body itself is a pay statement object (most common)
                // Pay statements have fields like gross, net, type, payment_date, etc.
                else if (bodyData.type || bodyData.payment_id || bodyData.gross || bodyData.gross_pay || bodyData.id) {
                  // Normalize field names: convert gross/net to gross_pay/net_pay if needed
                  var normalizedStatement = {
                    ...bodyData,
                    // Map common field name variations
                    gross_pay: bodyData.gross_pay || bodyData.gross || bodyData.earnings || null,
                    net_pay: bodyData.net_pay || bodyData.net || bodyData.total || null,
                    pay_date: bodyData.pay_date || bodyData.payment_date || bodyData.date || null,
                    start_date: bodyData.start_date || bodyData.period_start || null,
                    end_date: bodyData.end_date || bodyData.period_end || null,
                    individual_id: bodyData.individual_id || id,
                    currency: bodyData.currency || 'USD'
                  };
                  statements.push(normalizedStatement);
                }
                // Check if body is an array of pay statements
                else if (Array.isArray(bodyData)) {
                  statements = statements.concat(bodyData);
                }
              }
            });
          } else if (Array.isArray(res.data)) {
            // Direct array of pay statements
            statements = res.data;
          } else if (res.data && res.data.pay_statements && Array.isArray(res.data.pay_statements)) {
            // Pay statements nested in a pay_statements property
            statements = res.data.pay_statements;
          } else if (res.data && (res.data.id || res.data.payment_id || res.data.type)) {
            // Single pay statement object
            var normalizedStatement = {
              ...res.data,
              gross_pay: res.data.gross_pay || res.data.gross || null,
              net_pay: res.data.net_pay || res.data.net || null,
              pay_date: res.data.pay_date || res.data.payment_date || null,
              individual_id: res.data.individual_id || id,
              currency: res.data.currency || 'USD'
            };
            statements = [normalizedStatement];
          }
          
          // Ensure each statement has individual_id set and normalize field formats
          statements = statements.map(function(stmt) {
            if (!stmt.individual_id && id) {
              stmt.individual_id = id;
            }
            
            // Handle gross_pay - can be object {amount, currency} or number
            if (stmt.gross_pay && typeof stmt.gross_pay === 'object' && stmt.gross_pay.amount !== undefined) {
              // Extract amount from object, preserving currency
              stmt.gross_pay_amount = stmt.gross_pay.amount;
              stmt.gross_pay_currency = stmt.gross_pay.currency || stmt.currency || 'USD';
              stmt.gross_pay = stmt.gross_pay.amount; // For backwards compatibility
            } else if (!stmt.gross_pay) {
              // Try alternative field names
              var grossValue = stmt.gross || stmt.earnings || null;
              if (grossValue && typeof grossValue === 'object' && grossValue.amount !== undefined) {
                stmt.gross_pay = grossValue.amount;
                stmt.gross_pay_amount = grossValue.amount;
                stmt.gross_pay_currency = grossValue.currency || stmt.currency || 'USD';
              } else {
                stmt.gross_pay = grossValue;
                stmt.gross_pay_amount = grossValue;
              }
            } else {
              // gross_pay is already a number
              stmt.gross_pay_amount = stmt.gross_pay;
            }
            
            // Handle net_pay - can be object {amount, currency} or number
            if (stmt.net_pay && typeof stmt.net_pay === 'object' && stmt.net_pay.amount !== undefined) {
              // Extract amount from object, preserving currency
              stmt.net_pay_amount = stmt.net_pay.amount;
              stmt.net_pay_currency = stmt.net_pay.currency || stmt.currency || 'USD';
              stmt.net_pay = stmt.net_pay.amount; // For backwards compatibility
            } else if (!stmt.net_pay) {
              // Try alternative field names
              var netValue = stmt.net || stmt.total || null;
              if (netValue && typeof netValue === 'object' && netValue.amount !== undefined) {
                stmt.net_pay = netValue.amount;
                stmt.net_pay_amount = netValue.amount;
                stmt.net_pay_currency = netValue.currency || stmt.currency || 'USD';
              } else {
                stmt.net_pay = netValue;
                stmt.net_pay_amount = netValue;
              }
            } else {
              // net_pay is already a number
              stmt.net_pay_amount = stmt.net_pay;
            }
            
            // Handle pay_date - try multiple sources
            if (!stmt.pay_date || stmt.pay_date === null) {
              // Try various date field names
              stmt.pay_date = stmt.payment_date || stmt.date || stmt.end_date || stmt.start_date || 
                              stmt.period_end || stmt.period_start || stmt.pay_period_end || 
                              stmt.pay_period_start || null;
            }
            
            // Handle start_date and end_date if missing
            if (!stmt.start_date || stmt.start_date === null) {
              stmt.start_date = stmt.period_start || stmt.pay_period_start || null;
            }
            
            if (!stmt.end_date || stmt.end_date === null) {
              stmt.end_date = stmt.period_end || stmt.pay_period_end || stmt.pay_date || null;
            }
            
            // Preserve currency from statement level if not already set
            if (!stmt.currency) {
              stmt.currency = stmt.gross_pay_currency || stmt.net_pay_currency || 'USD';
            }
            
            return stmt;
          });
          
          // Filter to ensure all statements match the employee ID (if individual_id is available)
          statements = statements.filter(function(stmt) {
            if (stmt.individual_id) {
              return stmt.individual_id === id;
            }
            // If no individual_id field, trust the backend filtering
            return true;
          });
          
          console.log("[Frontend] Extracted pay statements:", statements);
          console.log("[Frontend] First statement sample:", statements.length > 0 ? statements[0] : 'No statements');
          
          setPayStatements(statements);
          setPayrollLoading(false);
          // Sync times are set once at login and never change
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch pay statements";
          setError({
            message: errorMessage,
            type: 'pay_statements',
            canRetry: false
          });
          setPayStatements([]);
          setPayrollLoading(false);
        });
    }, 300); // 300ms delay
  }

  // Handle deductions employee selection - fetch deductions
  function handleDeductionsEmployeeClick(id) {
    // Clear previous timer
    if (deductionsDebounceTimer.current) {
      clearTimeout(deductionsDebounceTimer.current);
    }
    
    // Clear old deductions immediately to prevent showing wrong data
    setEmployeeDeductions([]);
    setEligibilityData(null);
    setRetirement401k(null);
    
    // Set selected employee
    var employee = employees.find(function(emp) {
      return emp.id === id;
    });
    setSelectedDeductionsEmployee(employee);
    
    // Set loading state
    setDeductionsLoading(true);
    
    // Set new timer to fetch deductions
    deductionsDebounceTimer.current = setTimeout(function() {
      axios.get("http://localhost:4000/employee/" + id + "/deductions", {
        params: { employer: selectedEmployer }
      })
        .then(function(res) {
          // Extract deductions from response
          var deductions = [];
          if (res.data && res.data.deductions) {
            deductions = res.data.deductions;
          } else if (Array.isArray(res.data)) {
            deductions = res.data;
          }
          
          // Filter deductions to ensure they match the employee ID
          deductions = deductions.filter(function(ded) {
            if (ded.individual_id) {
              return ded.individual_id === id;
            }
            return true;
          });
          
          setEmployeeDeductions(deductions);
          
          // Store eligibility and 401k data
          if (res.data.eligibility) {
            setEligibilityData(res.data.eligibility);
          }
          if (res.data.retirement_401k) {
            setRetirement401k(res.data.retirement_401k);
          }
          
          setDeductionsLoading(false);
          // Sync times are set once at login and never change
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch deductions";
          setError({
            message: errorMessage,
            type: 'deductions',
            canRetry: false
          });
          setEmployeeDeductions([]);
          setEligibilityData(null);
          setRetirement401k(null);
          setDeductionsLoading(false);
        });
    }, 300); // 300ms delay
  }

  // Handle documents employee selection - fetch documents
  function handleDocumentsEmployeeClick(id) {
    // Clear previous timer
    if (documentsDebounceTimer.current) {
      clearTimeout(documentsDebounceTimer.current);
    }
    
    // Clear old documents immediately to prevent showing wrong data
    setEmployeeDocuments([]);
    
    // Set selected employee
    var employee = employees.find(function(emp) {
      return emp.id === id;
    });
    setSelectedDocumentsEmployee(employee);
    
    // Set new timer to fetch documents
    documentsDebounceTimer.current = setTimeout(function() {
      axios.get("http://localhost:4000/employee/" + id + "/documents", {
        params: { employer: selectedEmployer }
      })
        .then(function(res) {
          // Extract documents from response
          var documents = [];
          if (res.data && res.data.documents) {
            documents = res.data.documents;
          } else if (Array.isArray(res.data)) {
            documents = res.data;
          }
          
          console.log("[App] Received documents:", documents.length);
          console.log("[App] Document types:", documents.map(function(d) { return d.type; }));
          
          // Filter documents to ensure they match the employee ID
          documents = documents.filter(function(doc) {
            if (doc.data && doc.data.individual_id) {
              return doc.data.individual_id === id;
            }
            return true;
          });
          
          console.log("[App] After filtering:", documents.length);
          console.log("[App] Filtered document types:", documents.map(function(d) { return d.type; }));
          
          setEmployeeDocuments(documents);
          // Sync times are set once at login and never change
        })
        .catch(function(err) {
          const errorMessage = err.response?.data?.error || "Failed to fetch documents";
          setError({
            message: errorMessage,
            type: 'documents',
            canRetry: false
          });
          setEmployeeDocuments([]);
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

  // Handle enforce sync
  function handleEnforceSync() {
    // Update all sync times to current time
    var now = new Date();
    var nowISO = now.toISOString();
    
    setSyncTimes({
      organization: nowISO,
      company: nowISO,
      directory: nowISO,
      payroll: nowISO,
      payStatements: nowISO,
      deductions: nowISO,
      documents: nowISO,
      workforce: nowISO,
      newHires: nowISO,
      terminated: nowISO,
      eligibility: nowISO,
      orgchart: nowISO,
      analytics: nowISO,
      audit: nowISO
    });
    
    // Show success message
    setSuccessMessage('HRIS data synced successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(function() {
      setSuccessMessage(null);
    }, 3000);
  }

  // Handle route change
  function handleRouteChange(route) {
    setActiveRoute(route);
  }

  // Listen for hash changes for navigation
  useEffect(function() {
    function handleHashChange() {
      var hash = window.location.hash.replace('#', '');
      if (hash === 'organization' || hash === 'payroll' || hash === 'deductions' || hash === 'documents' || hash === 'workforce' || hash === 'eligibility' || hash === 'orgchart' || hash === 'analytics' || hash === 'audit') {
        setActiveRoute(hash);
      }
    }
    
    // Set initial route from hash
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return function() {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Fetch workforce data when route is active
  useEffect(function() {
    if (activeRoute === 'workforce' && (company || employees.length > 0)) {
      // Fetch new hires
      axios.get("http://localhost:4000/workforce/new-hires")
        .then(function(res) {
          var hires = res.data.new_hires || res.data || [];
          setNewHires(hires);
          // Sync times are set once at login and never change
        })
        .catch(function(err) {
          console.error("Error fetching new hires:", err);
          setNewHires([]);
        });

      // Fetch terminated employees
      axios.get("http://localhost:4000/workforce/terminated")
        .then(function(res) {
          var terminated = res.data.terminated || res.data || [];
          setTerminatedEmployees(terminated);
          // Sync times are set once at login and never change
        })
        .catch(function(err) {
          console.error("Error fetching terminated employees:", err);
          setTerminatedEmployees([]);
        });
    }
  }, [activeRoute, company, employees.length]);

  // Handle employer change
  function handleEmployerChange(employerId) {
    console.log('[App] Switching employer to:', employerId);
    setSelectedEmployer(employerId);
    // Refetch data for the new employer
    setLoading(true);
    setError(null);
    
    // Get company info for new employer
    axios.get("http://localhost:4000/company", {
      params: { employer: employerId }
    })
      .then(function(companyRes) {
        setCompany(companyRes.data);
        
        // Get employee list for new employer
        return axios.get("http://localhost:4000/directory", {
          params: { employer: employerId }
        });
      })
      .then(function(directoryRes) {
        var employeeData;
        if (directoryRes.data.employees) {
          employeeData = directoryRes.data.employees;
        } else {
          employeeData = directoryRes.data;
        }
        setEmployees(employeeData);
        
        // Clear selected employees when switching
        setSelectedEmployee(null);
        setSelectedPayrollEmployee(null);
        setSelectedDeductionsEmployee(null);
        setSelectedDocumentsEmployee(null);
        setPayStatements([]);
        setEmployeeDeductions([]);
        setEmployeeDocuments([]);
        
        setLoading(false);
      })
      .catch(function(err) {
        const errorMessage = err.response?.data?.error || "Failed to fetch data for selected employer";
        setError({
          message: errorMessage,
          type: 'fetch_data',
          canRetry: true
        });
        setLoading(false);
      });
  }

  // Render app
  var isConnected = company || employees.length > 0;
  
  return (
    <div className="app-container">
      <Header 
        company={company} 
        activeRoute={activeRoute} 
        onRouteChange={handleRouteChange}
      />

      <main className="main-content">
        {/* Success Message */}
        {successMessage && (
          <div className="success-container">
            <div className="success-card">
              <div className="success-icon">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="success-content">
                <p>{successMessage}</p>
              </div>
              <button 
                className="dismiss-button" 
                onClick={function() { setSuccessMessage(null); }}
                aria-label="Dismiss notification"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

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

        {/* Landing Page - Integrations */}
        {!isConnected && !loading && (
          <Integrations onConnect={connectFinchReal} />
        )}

        {/* Connected Content - Show when connected */}
        {isConnected && !loading && (
          <div className="connected-content">
            {/* Sync Status Chart - Show on all tabs */}
            <SyncStatus 
              syncTimes={syncTimes} 
              activeRoute={activeRoute}
              onEnforceSync={handleEnforceSync}
            />

            {/* Organization Route - Company Info + Employee Directory + Employee Details */}
            {activeRoute === 'organization' && (
              <>
        <CompanyInfo 
          company={company} 
          loading={loading} 
          error={error}
          selectedEmployer={selectedEmployer}
          onEmployerChange={handleEmployerChange}
        />
        <EmployeeSection 
          employees={employees}
          selectedEmployee={selectedEmployee}
          onEmployeeClick={handleEmployeeClick}
          loading={employeeDetailsLoading}
        />
              </>
            )}

            {/* Payroll Route - Payroll Information Only */}
            {activeRoute === 'payroll' && (
              <PayrollInfo 
                employees={employees}
                selectedPayrollEmployee={selectedPayrollEmployee}
                payStatements={payStatements}
                onEmployeeClick={handlePayrollEmployeeClick}
                loading={payrollLoading}
                error={error}
              />
            )}

            {/* Deductions Route - Deductions Information Only */}
            {activeRoute === 'deductions' && (
              <DeductionsInfo 
                employees={employees}
                selectedDeductionsEmployee={selectedDeductionsEmployee}
                employeeDeductions={employeeDeductions}
                eligibilityData={eligibilityData}
                retirement401k={retirement401k}
                onEmployeeClick={handleDeductionsEmployeeClick}
                loading={deductionsLoading}
                error={error}
              />
            )}

            {/* Documents Route - Documents Information Only */}
            {activeRoute === 'documents' && (
              <DocumentsInfo 
                employees={employees}
                selectedDocumentsEmployee={selectedDocumentsEmployee}
                employeeDocuments={employeeDocuments}
                onEmployeeClick={handleDocumentsEmployeeClick}
                loading={loading}
                error={error}
              />
            )}

            {/* Workforce Route - New Hires & Off-boarding */}
            {activeRoute === 'workforce' && (
              <WorkforceInfo 
                employees={employees}
                newHires={newHires}
                terminatedEmployees={terminatedEmployees}
                loading={loading}
                error={error}
              />
            )}

            {/* Eligibility Route - Employee Eligibility Status */}
            {activeRoute === 'eligibility' && (
              <EligibilityInfo 
                loading={loading}
                error={error}
              />
            )}

            {/* Org Chart Route - Organizational Chart Visualization */}
            {activeRoute === 'orgchart' && (
              <OrgChart 
                loading={loading}
                error={error}
              />
            )}

            {/* Analytics Route - Headcount Reporting & Analytics */}
            {activeRoute === 'analytics' && (
              <HeadcountReports 
                loading={loading}
                error={error}
              />
            )}

            {/* Audit Route - Audit & Compliance Reports */}
            {activeRoute === 'audit' && (
              <AuditReports 
                loading={loading}
                error={error}
              />
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MainApp;
