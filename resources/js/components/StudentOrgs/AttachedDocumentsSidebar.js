import React from 'react';
import { FileText, X } from 'lucide-react';

const AttachedDocumentsSidebar = ({ attachedDocuments, onRemoveDocument }) => {
  return (
    <div className="attached-documents-sidebar">
      <div className="attached-documents-container">
        <div className="attached-documents-header">
          <h3 className="attached-documents-title">
            <FileText size={18} />
            Attached Documents
          </h3>
          {attachedDocuments.length > 0 && (
            <span className="attached-documents-count">
              {attachedDocuments.length}
            </span>
          )}
        </div>

        {attachedDocuments.length > 0 ? (
          <div className="attached-documents-list">
            {attachedDocuments.map((doc, index) => (
              <div key={index} className="attached-document-item">
                <div className="attached-document-info">
                  <FileText size={16} />
                  <div className="attached-document-details">
                    <span className="attached-document-name">
                      {doc.name || doc.id || 'Unknown Document'}
                    </span>
                    {doc.description && (
                      <small className="attached-document-description">{doc.description}</small>
                    )}
                    {doc.type && (
                      <small className="attached-document-type">
                        {doc.type === 'form' ? 'Form' : 'Supporting Document'}
                      </small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="attached-document-remove"
                  onClick={() => onRemoveDocument(index)}
                  title="Remove document"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="attached-documents-empty">
            <FileText size={48} className="empty-icon" />
            <p>No documents attached yet</p>
            <small>Click "Add Form Documents" to attach forms and supporting files</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachedDocumentsSidebar;
