import React from 'react';

function EmployeeDocuments(props) {
  var documents = props.documents || [];
  var loading = props.loading;
  var employeeName = props.employeeName || 'Employee';

  if (loading) {
    return <div className="employee-documents-loading">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="employee-documents-container">
        <h3>Documents for {employeeName}</h3>
        <p>No documents found for this employee.</p>
      </div>
    );
  }

  // Helper function to format document type
  function formatDocumentType(type) {
    if (!type) return 'Document';
    if (type === 'w4_2020') return 'W-4 (2020)';
    if (type === 'w4_2005') return 'W-4 (2005)';
    return type.toUpperCase().replace(/_/g, ' ');
  }

  // Helper function to format filing status
  function formatFilingStatus(status) {
    if (!status) return 'N/A';
    return status.split('_').map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  // Helper function to format currency
  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  console.log("[EmployeeDocuments] Rendering documents:", documents.length);
  console.log("[EmployeeDocuments] Document types:", documents.map(function(d) { return d.type; }));

  return (
    <div className="employee-documents-container">
      <h3>Documents for {employeeName}</h3>
      
      <div className="documents-list">
        {documents.map(function(doc, index) {
          var docData = doc.data || {};
          var isW4 = doc.type === 'w4_2020' || doc.type === 'w4_2005';
          
          console.log("[EmployeeDocuments] Rendering document:", doc.type, "index:", index);
          
          return (
            <div key={doc.document_id || doc.id || index} className="document-card">
              <div className="document-header">
                <h4 className="document-name">{formatDocumentType(doc.type)}</h4>
                {doc.type && <span className="document-type-badge">{doc.type}</span>}
                {doc.year && <span className="document-year">Year: {doc.year}</span>}
              </div>
              <div className="document-body">
                {isW4 && docData ? (
                  doc.type === 'w4_2005' ? (
                    <div className="w4-document-details">
                      <div className="document-detail-grid">
                        <div className="document-detail-item">
                          <span className="detail-label">Filing Status</span>
                          <span className="detail-value">{formatFilingStatus(docData.filing_status)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Total Number of Allowances</span>
                          <span className="detail-value">{docData.total_number_of_allowances || 0}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Additional Withholding</span>
                          <span className="detail-value">{formatCurrency(docData.additional_withholding || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Exemption</span>
                          <span className="detail-value">{docData.exemption || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w4-document-details">
                      <div className="document-detail-grid">
                        <div className="document-detail-item">
                          <span className="detail-label">Filing Status</span>
                          <span className="detail-value">{formatFilingStatus(docData.filing_status)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Qualifying Children Under 17</span>
                          <span className="detail-value">{formatCurrency(docData.amount_for_qualifying_children_under_17 || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Total Dependent Credits</span>
                          <span className="detail-value">{formatCurrency(docData.total_claim_dependent_and_other_credits || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Other Dependents</span>
                          <span className="detail-value">{formatCurrency(docData.amount_for_other_dependents || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Other Income</span>
                          <span className="detail-value">{formatCurrency(docData.other_income || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Deductions</span>
                          <span className="detail-value">{formatCurrency(docData.deductions || 0)}</span>
                        </div>
                        <div className="document-detail-item">
                          <span className="detail-label">Extra Withholding</span>
                          <span className="detail-value">{formatCurrency(docData.extra_withholding || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="document-data">
                    {docData && Object.keys(docData).length > 0 ? (
                      <pre>{JSON.stringify(docData, null, 2)}</pre>
                    ) : (
                      <p>No document data available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeDocuments;
