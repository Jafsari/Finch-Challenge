import React, { useState, useEffect } from 'react';

function PayStatementHistory(props) {
  var payStatements = props.payStatements || [];
  var employeeId = props.employeeId;
  var employeeName = props.employeeName || 'Employee';
  var loading = props.loading;

  var [expandedStatements, setExpandedStatements] = useState({});

  // Reset expanded statements when payStatements or employee changes
  useEffect(function() {
    setExpandedStatements({});
  }, [payStatements, employeeId]);

  // Filter statements by employeeId
  var filteredStatements = payStatements.filter(function(statement) {
    return statement.individual_id === employeeId || !employeeId;
  });

  var formatCurrency = function(amount, currency) {
    // Handle if amount is an object with .amount property
    if (amount && typeof amount === 'object' && amount.amount !== undefined) {
      amount = amount.amount;
      currency = amount.currency || currency;
    }
    
    if (amount === null || amount === undefined || isNaN(amount)) return "";
    
    // Convert to number if it's a string
    amount = Number(amount);
    if (isNaN(amount)) return "";
    
    // Assume amounts from API are in cents (integer values > 100 typically)
    // If amount is less than 100, assume it's already in dollars
    var displayAmount = (amount > 100 || amount < -100) ? (amount / 100) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(displayAmount);
  };

  var calculateTotals = function() {
    var totals = {
      grossPay: 0,
      netPay: 0,
      totalHours: 0,
      count: filteredStatements.length
    };

    filteredStatements.forEach(function(statement) {
      // Handle gross_pay - extract amount if it's an object
      var grossPay = statement.gross_pay;
      if (grossPay && typeof grossPay === 'object' && grossPay.amount !== undefined) {
        grossPay = grossPay.amount;
      }
      if (grossPay) {
        grossPay = Number(grossPay);
        if (!isNaN(grossPay)) {
          totals.grossPay += (grossPay / 100);
        }
      }
      
      // Handle net_pay - extract amount if it's an object
      var netPay = statement.net_pay;
      if (netPay && typeof netPay === 'object' && netPay.amount !== undefined) {
        netPay = netPay.amount;
      }
      if (netPay) {
        netPay = Number(netPay);
        if (!isNaN(netPay)) {
          totals.netPay += (netPay / 100);
        }
      }
      
      // Handle hours
      if (statement.hours || statement.total_hours) {
        totals.totalHours += (Number(statement.hours || statement.total_hours) || 0);
      }
    });

    return totals;
  };

  var totals = calculateTotals();

  var toggleExpand = function(statementId) {
    setExpandedStatements(function(prev) {
      var newState = { ...prev };
      newState[statementId] = !newState[statementId];
      return newState;
    });
  };

  if (loading) {
    return <div className="pay-statement-loading">Loading pay statements...</div>;
  }

  if (filteredStatements.length === 0) {
    return (
      <div className="pay-statement-empty">
        <h3>Pay Statement History for {employeeName}</h3>
        <p>No pay statements found for this employee.</p>
      </div>
    );
  }

  return (
    <div className="pay-statement-container">
      <div className="pay-statement-header">
        <h3>Pay Statement History for {employeeName}</h3>
      </div>
      
      {/* Summary Totals */}
      <div className="pay-statement-summary">
        <div className="summary-item">
          <span className="summary-label">Total Statements</span>
          <span className="summary-value">{totals.count}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Gross Pay</span>
          <span className="summary-value highlight">{formatCurrency(totals.grossPay * 100, 'USD')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Net Pay</span>
          <span className="summary-value highlight">{formatCurrency(totals.netPay * 100, 'USD')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Hours</span>
          <span className="summary-value">{totals.totalHours.toFixed(2)}</span>
        </div>
      </div>

      {/* Pay Statement Cards */}
      <div className="pay-statement-list">
        {filteredStatements.map(function(statement, index) {
          var isExpanded = expandedStatements[statement.id || index];
          var currency = statement.currency || 'USD';
          
          // Calculate taxes
          var employeeTaxes = 0;
          var employerTaxes = 0;
          if (statement.taxes && Array.isArray(statement.taxes)) {
            statement.taxes.forEach(function(tax) {
              var taxAmount = (tax.amount || 0) / 100;
              if (tax.employer === false) {
                employeeTaxes += taxAmount;
              } else if (tax.employer === true) {
                employerTaxes += taxAmount;
              }
            });
          }

          // Calculate deductions
          var totalDeductions = 0;
          if (statement.employee_deductions && Array.isArray(statement.employee_deductions)) {
            statement.employee_deductions.forEach(function(ded) {
              totalDeductions += ((ded.amount || 0) / 100);
            });
          }

          return (
            <div key={statement.id || index} className="pay-statement-card">
              <div className="pay-statement-card-header" onClick={function() { toggleExpand(statement.id || index); }}>
                <div className="statement-main-info">
                  <div className="statement-period">
                    <span className="statement-type-badge">{statement.type ? statement.type.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }) : 'Regular'}</span>
                    {(statement.pay_date || statement.end_date || statement.start_date || statement.payment_date) && (
                      <span>{statement.pay_date || statement.end_date || statement.start_date || statement.payment_date}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {statement.payment_method && (
                      <span className="statement-method">
                        {statement.payment_method.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); })}
                      </span>
                    )}
                    {(statement.start_date || statement.end_date || statement.pay_date) && (
                      <span>
                        {statement.start_date && statement.end_date 
                          ? statement.start_date + ' - ' + statement.end_date 
                          : (statement.end_date || statement.start_date || statement.pay_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="statement-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Gross Pay</span>
                    <span className="amount-value">{formatCurrency(statement.gross_pay, currency)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Net Pay</span>
                    <span className="amount-value highlight">{formatCurrency(statement.net_pay, currency)}</span>
                  </div>
                </div>
                <button className="expand-button" onClick={function(e) { e.stopPropagation(); toggleExpand(statement.id || index); }}>
                  {isExpanded ? '−' : '+'}
                </button>
              </div>

              {isExpanded && (
                <div className="pay-statement-card-body">
                  <div className="statement-details-grid">
                    {/* Earnings Section */}
                    <div className="statement-section">
                      <h4 className="section-title">Earnings</h4>
                      <div className="section-content">
                        <table className="statement-table">
                          <tbody>
                            <tr>
                              <td>Gross Pay</td>
                              <td className="text-right">{formatCurrency(statement.gross_pay, currency)}</td>
                            </tr>
                            {statement.hours && (
                              <tr>
                                <td>Hours</td>
                                <td className="text-right">{statement.hours}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Taxes Section */}
                    {statement.taxes && statement.taxes.length > 0 && (
                      <div className="statement-section">
                        <h4 className="section-title">Taxes</h4>
                        <div className="section-content">
                          <table className="statement-table">
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th className="text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {statement.taxes.map(function(tax, taxIndex) {
                                // Display name if available, otherwise use type, otherwise fallback
                                var taxDisplayName = tax.name || tax.type || 'Tax';
                                // Add type in parentheses if name exists but is different from type
                                if (tax.name && tax.type && tax.name !== tax.type && !tax.name.toLowerCase().includes(tax.type.toLowerCase())) {
                                  taxDisplayName = tax.name + ' (' + tax.type + ')';
                                }
                                return (
                                  <tr key={taxIndex}>
                                    <td>{taxDisplayName}</td>
                                    <td className="text-right">{formatCurrency(tax.amount, tax.currency || currency)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="table-total">
                                <td>Total Employee Taxes</td>
                                <td className="text-right">{formatCurrency(employeeTaxes * 100, currency)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Deductions Section */}
                    {statement.employee_deductions && statement.employee_deductions.length > 0 && (
                      <div className="statement-section">
                        <h4 className="section-title">Deductions</h4>
                        <div className="section-content">
                          <table className="statement-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th className="text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {statement.employee_deductions.map(function(deduction, dedIndex) {
                                return (
                                  <tr key={dedIndex}>
                                    <td>{deduction.name || 'Deduction'}</td>
                                    <td className="text-right">{formatCurrency(deduction.amount, deduction.currency || currency)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="table-total">
                                <td>Total Deductions</td>
                                <td className="text-right">{formatCurrency(totalDeductions * 100, currency)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Net Pay Summary */}
                    <div className="statement-section">
                      <div className="statement-summary-footer">
                        <div className="summary-row total-row">
                          <span className="summary-label">Net Pay</span>
                          <span className="summary-amount highlight">{formatCurrency(statement.net_pay, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PayStatementHistory;
