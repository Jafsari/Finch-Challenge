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

  return (
    <div className="employee-documents-container">
      <h3>Documents for {employeeName}</h3>
      
      <div className="documents-list">
        {documents.map(function(doc, index) {
          return (
            <div key={doc.id || index} className="document-card">
              <div className="document-header">
                <h4 className="document-name">{doc.title || doc.filename || 'Document'}</h4>
                {doc.type && <span className="document-type-badge">{doc.type}</span>}
              </div>
              <div className="document-body">
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-link">
                    View Document
                  </a>
                )}
                {doc.created_at && (
                  <div className="document-meta">
                    <span>Created: {new Date(doc.created_at).toLocaleDateString()}</span>
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
