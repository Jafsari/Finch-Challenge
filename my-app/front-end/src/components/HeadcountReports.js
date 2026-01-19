import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Headcount Reporting and Analytics component
function HeadcountReports(props) {
  var loading = props.loading;
  var error = props.error;
  
  var [reportsData, setReportsData] = useState(null);
  var [isLoading, setIsLoading] = useState(false);
  var [reportsError, setReportsError] = useState(null);

  // Fetch reports data
  useEffect(function() {
    setIsLoading(true);
    setReportsError(null);
    
    axios.get("http://localhost:4000/headcount/reports")
      .then(function(res) {
        setReportsData(res.data);
        setIsLoading(false);
      })
      .catch(function(err) {
        const errorMessage = err.response?.data?.error || "Failed to fetch headcount reports";
        setReportsError({
          message: errorMessage,
          details: err.response?.data
        });
        setIsLoading(false);
      });
  }, []);

  // Format currency
  function formatCurrency(amount) {
    if (!amount || amount === 0) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format percentage
  function formatPercent(value) {
    return parseFloat(value).toFixed(1) + '%';
  }

  if (isLoading || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
        Loading headcount reports...
      </div>
    );
  }

  if (reportsError || error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <strong>Error:</strong> {(reportsError || error).message}
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
        No reports data available.
      </div>
    );
  }

  var headcount = reportsData.headcount || {};
  var compensation = reportsData.compensation || {};
  var benefits = reportsData.benefits || {};
  var strategic = reportsData.strategic || {};
  var participationFunnel = reportsData.participation_funnel || {};

  return (
    <div id="headcount" className="headcount-reports-section">
      <div className="info-card" style={{ marginBottom: '2rem' }}>
        <h2>Headcount Reporting & Analytics</h2>
        <p style={{ marginBottom: '0', color: '#4b5563', fontSize: '0.9375rem' }}>
          Comprehensive workforce analytics, compensation insights, and benefits utilization reports.
        </p>
      </div>

      {/* Strategic Insights Summary */}
      {strategic && Object.keys(strategic).length > 0 && (
        <div className="info-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a' }}>Strategic Insights</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {strategic.total_headcount !== undefined && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#dbeafe',
                borderRadius: '6px',
                border: '1px solid #93c5fd'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.25rem' }}>Total Headcount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{strategic.total_headcount}</div>
              </div>
            )}
            {strategic.active_headcount !== undefined && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#d1fae5',
                borderRadius: '6px',
                border: '1px solid #86efac'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.25rem' }}>Active Employees</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#065f46' }}>{strategic.active_headcount}</div>
              </div>
            )}
            {strategic.turnover_rate !== undefined && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.25rem' }}>Turnover Rate (30d)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#991b1b' }}>{formatPercent(strategic.turnover_rate)}</div>
              </div>
            )}
            {strategic.hiring_rate !== undefined && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#dbeafe',
                borderRadius: '6px',
                border: '1px solid #93c5fd'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.25rem' }}>Hiring Rate (90d)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{formatPercent(strategic.hiring_rate)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Headcount Reporting */}
      <div className="info-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a' }}>Headcount Analysis</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>By Department</h4>
          {headcount.by_department && Object.keys(headcount.by_department).length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries(headcount.by_department).map(function([dept, count]) {
                var percentage = headcount.total > 0 ? ((count / headcount.total) * 100).toFixed(1) : 0;
                return (
                  <div key={dept} style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#1a1a1a', fontWeight: '500' }}>{dept}</span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>{count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No department data available.</p>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>By Employment Type</h4>
          {headcount.by_employment_type && Object.keys(headcount.by_employment_type).length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries(headcount.by_employment_type).map(function([type, count]) {
                return (
                  <div key={type} style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#1a1a1a', fontWeight: '500', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No employment type data available.</p>
          )}
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>By Status</h4>
          {headcount.by_status && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#d1fae5',
                borderRadius: '6px',
                border: '1px solid #86efac'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#065f46', marginRight: '0.5rem' }}>Active:</span>
                <span style={{ color: '#065f46', fontWeight: '600' }}>{headcount.by_status.active || 0}</span>
              </div>
              <div style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#991b1b', marginRight: '0.5rem' }}>Inactive:</span>
                <span style={{ color: '#991b1b', fontWeight: '600' }}>{headcount.by_status.inactive || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compensation Analytics */}
      {compensation && compensation.count > 0 && (
        <div className="info-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a' }}>Compensation Analytics</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#dbeafe',
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.25rem' }}>Average</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e40af' }}>{formatCurrency(compensation.average)}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>Minimum</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#374151' }}>{formatCurrency(compensation.minimum)}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#dbeafe',
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.25rem' }}>Maximum</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e40af' }}>{formatCurrency(compensation.maximum)}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>Total Payroll</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#374151' }}>{formatCurrency(compensation.total)}</div>
            </div>
          </div>

          {compensation.distribution && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>Compensation Distribution</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>&lt; $50k</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>{compensation.distribution.under_50k || 0}</div>
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>$50k - $100k</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>{compensation.distribution.between_50k_100k || 0}</div>
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>$100k - $150k</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>{compensation.distribution.between_100k_150k || 0}</div>
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>&gt; $150k</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>{compensation.distribution.over_150k || 0}</div>
                </div>
              </div>
            </div>
          )}

          {compensation.by_department && Object.keys(compensation.by_department).length > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>Average Compensation by Department</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.75rem'
              }}>
                {Object.entries(compensation.by_department).map(function([dept, data]) {
                  return (
                    <div key={dept} style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#1a1a1a', fontWeight: '500' }}>{dept}</span>
                      <span style={{ color: '#3b82f6', fontWeight: '600' }}>{formatCurrency(data.average)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participation Funnel */}
      {participationFunnel && participationFunnel.eligible_employees !== undefined && (
        <div className="info-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a' }}>Participation Funnel</h3>
          
          {/* Demo Moment / Insight */}
          {participationFunnel.enrollment_rate && participationFunnel.contribution_rate && (
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
              borderRadius: '12px',
              border: '2px solid #fbbf24',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '0.5rem'
              }}>
                💡 Insight
              </div>
              <div style={{
                fontSize: '1.125rem',
                color: '#78350f',
                lineHeight: '1.6'
              }}>
                You have <strong>{participationFunnel.enrollment_rate}%</strong> enrollment, but only <strong>{participationFunnel.contribution_rate}%</strong> are actually contributing.
              </div>
            </div>
          )}
          
          {/* Funnel Visualization */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Eligible Employees */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '12px',
              border: '2px solid #3b82f6',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e40af'
                }}>
                  Eligible Employees
                </span>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e40af'
                }}>
                  {participationFunnel.eligible_employees || 0}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#1e3a8a'
              }}>
                Employees with 90+ days of service
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
              }}></div>
            </div>

            {/* Enrolled Employees */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: '12px',
              border: '2px solid #10b981',
              position: 'relative',
              overflow: 'hidden',
              width: participationFunnel.eligible_employees > 0 ? 
                Math.max(50, ((participationFunnel.enrolled_employees / participationFunnel.eligible_employees) * 100)) + '%' : '100%',
              transition: 'width 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#065f46'
                }}>
                  Enrolled Employees
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#047857'
                  }}>
                    {participationFunnel.enrollment_rate || 0}%
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#065f46'
                  }}>
                    {participationFunnel.enrolled_employees || 0}
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#064e3b'
              }}>
                Employees enrolled in 401k plan
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
              }}></div>
            </div>

            {/* Active Contributors */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px',
              border: '2px solid #f59e0b',
              position: 'relative',
              overflow: 'hidden',
              width: participationFunnel.enrolled_employees > 0 ? 
                Math.max(40, ((participationFunnel.active_contributors / participationFunnel.enrolled_employees) * 100)) + '%' : '100%',
              transition: 'width 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  Active Contributors
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#b45309'
                  }}>
                    {participationFunnel.contribution_rate || 0}%
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#92400e'
                  }}>
                    {participationFunnel.active_contributors || 0}
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#78350f'
              }}>
                Enrolled employees with active deductions (deductions &gt; 0)
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
              }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Utilization */}
      {benefits && benefits.total_benefits > 0 && (
        <div className="info-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a1a1a' }}>Benefits Utilization Analysis</h3>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
              <strong>Total Benefits Offered:</strong> {benefits.total_benefits}
            </div>
          </div>

          {benefits.utilization && Object.keys(benefits.utilization).length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(benefits.utilization).map(function([type, data]) {
                return (
                  <div key={type} style={{
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                      {data.benefit_name || type}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <div>Frequency: {data.frequency}</div>
                      <div>Status: {data.available ? 'Available' : 'Not Available'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No benefits utilization data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HeadcountReports;
