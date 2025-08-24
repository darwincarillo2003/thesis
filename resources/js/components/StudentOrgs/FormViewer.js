import React, { useState } from 'react';
import { X } from 'lucide-react';
import PettyCashVoucher from './Forms/PettyCashVoucher';
import CashVoucher from './Forms/CashVoucher';
import AcknowledgmentForm from './Forms/AcknowledgmentForm';
import CommunicationExpenseForm from './Forms/CommunicationExpenseForm';
import TransportationForm from './Forms/TransportationForm';
import ReimbursementForm from './Forms/ReimbursementForm';
import TravelForm from './Forms/TravelForm';
import '../../../sass/StudentOrgDashboard/FormViewer.scss';

const FormViewer = ({ isOpen, onClose, formId, onSave }) => {
  const [formData, setFormData] = useState({});

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  const handleSaveForm = () => {
    onSave({ formId, formData });
    onClose();
  };

  const renderForm = () => {
    const commonProps = {
      formData,
      onDataChange: handleFormDataChange,
      onSave: handleSaveForm,
      onCancel: onClose
    };

    switch (formId) {
      case 'FORM-01':
        return <PettyCashVoucher {...commonProps} />;
      case 'FORM-02':
        return <CashVoucher {...commonProps} />;
      case 'FORM-03':
        return <AcknowledgmentForm {...commonProps} />;
      case 'FORM-04':
        return <CommunicationExpenseForm {...commonProps} />;
      case 'FORM-05':
        return <TransportationForm {...commonProps} />;
      case 'FORM-06':
        return <ReimbursementForm {...commonProps} />;
      case 'FORM-07':
        return <TravelForm {...commonProps} />;
      default:
        return (
          <div className="form-viewer__error">
            <p>Form not found: {formId}</p>
            <button onClick={onClose} className="form-viewer__btn form-viewer__btn--secondary">
              Close
            </button>
          </div>
        );
    }
  };

  if (!isOpen || !formId) return null;

  return (
    <div className="form-viewer-overlay" onClick={onClose}>
      <div className="form-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="form-viewer__header">
          <h2 className="form-viewer__title">Digital Form - {formId}</h2>
          <button 
            className="form-viewer__close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="form-viewer__content">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default FormViewer;



