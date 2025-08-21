import React, { useState, useEffect } from 'react';
import { Save, Printer, Download, FileText, Send } from 'lucide-react';
import CashFlowStatement from './CashFlowStatement';
import AttachedDocumentsSidebar from './AttachedDocumentsSidebar';
import AddFormDocumentsModal from './AddFormDocumentsModal';
import '../../../sass/StudentOrgDashboard/SubmitForm.scss';

const SubmitForm = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const [academicYear, setAcademicYear] = useState(`${currentYear}-${nextYear}`);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [formData, setFormData] = useState({
    organizationName: '',
    month: '',
    academicYear: `${currentYear}-${nextYear}`,
    cashInflows: {
      beginningCashInBank: { month: '', amount: '' },
      beginningCashOnHand: { month: '', amount: '' },
      cashReceiptSources: [{ description: '', amount: '' }],
    },
    cashOutflows: {
      organizationAllocations: [],
      otherDisbursements: [],
      contingencyFund: [],
    },
    endingCashBalance: {
      cashInBank: '',
      cashOnHand: '',
    }
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState([]);

  // Format number as Philippine Peso
  const formatAsPeso = (value) => {
    if (!value) return '';
    const numValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(numValue);
  };

  // Format for display without the currency symbol
  const formatNumberOnly = (value) => {
    if (!value) return '';
    const numValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2
    }).format(numValue);
  };

  // Parse peso string to number
  const parseFromPeso = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;
  };

  // Handle input changes
  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      
      if (index !== null) {
        newState[section][field][index] = { ...newState[section][field][index], ...value };
      } else if (field) {
        if (section === 'cashInflows' && (field === 'beginningCashInBank' || field === 'beginningCashOnHand')) {
          newState[section][field] = { ...newState[section][field], ...value };
        } else {
          newState[section][field] = value;
        }
      } else {
        newState[section] = value;
      }
      
      return newState;
    });
  };

  // Handle academic year change
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    setAcademicYear(value);
    setFormData(prevState => ({
      ...prevState,
      academicYear: value
    }));
  };

  // Add new row to a table
  const addTableRow = (section, table) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      if (section === 'cashInflows' && table === 'cashReceiptSources') {
        newState[section][table].push({ description: '', amount: '' });
      } else {
        newState[section][table].push({ date: '', details: '', invoiceNumber: '', amount: '' });
      }
      return newState;
    });
  };

  // Remove row from a table
  const removeTableRow = (section, table, index) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState[section][table].splice(index, 1);
      return newState;
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    // Calculate total cash inflows
    const beginningCashInBank = parseFromPeso(formData.cashInflows.beginningCashInBank.amount);
    const beginningCashOnHand = parseFromPeso(formData.cashInflows.beginningCashOnHand.amount);
    const receiptSources = formData.cashInflows.cashReceiptSources.reduce(
      (sum, item) => sum + parseFromPeso(item.amount), 0
    );
    const totalCashInflows = beginningCashInBank + beginningCashOnHand + receiptSources;

    // Calculate total cash outflows
    const organizationAllocations = formData.cashOutflows.organizationAllocations.reduce(
      (sum, item) => sum + parseFromPeso(item.amount), 0
    );
    const otherDisbursements = formData.cashOutflows.otherDisbursements.reduce(
      (sum, item) => sum + parseFromPeso(item.amount), 0
    );
    const contingencyFund = formData.cashOutflows.contingencyFund.reduce(
      (sum, item) => sum + parseFromPeso(item.amount), 0
    );
    const totalCashOutflows = organizationAllocations + otherDisbursements + contingencyFund;

    // Calculate ending cash balance
    const cashInBank = parseFromPeso(formData.endingCashBalance.cashInBank);
    const cashOnHand = parseFromPeso(formData.endingCashBalance.cashOnHand);
    const totalEndingCashBalance = cashInBank + cashOnHand;

    return {
      totalCashInflows,
      totalCashOutflows,
      totalEndingCashBalance,
      organizationAllocations,
      otherDisbursements,
      contingencyFund
    };
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  // Handle draft save
  const handleDraft = () => {
    console.log('Form saved as draft:', formData);
    // Here you would save the form as draft
  };

  // Handle export to PDF
  const handleExport = () => {
    // This would be implemented with a PDF library like jsPDF
    alert('Export to PDF functionality will be implemented');
  };

  // Handle modal functions
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveDocuments = (documentData) => {
    const newDocuments = [
      ...documentData.selectedForms.map(form => ({ ...form, type: 'form' })),
      ...documentData.supportingDocuments.map(doc => ({ ...doc, type: 'document' }))
    ];
    setAttachedDocuments(prev => [...prev, ...newDocuments]);
    console.log('Documents saved:', documentData);
  };

  const handleRemoveAttachedDocument = (indexToRemove) => {
    setAttachedDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="submit-form">
      <div className="submit-form__header">
        <h1 className="submit-form__title">Statement of Cash Flows</h1>
        <div className="submit-form__header-actions">
          <button type="button" className="submit-form__header-btn" onClick={handleOpenModal}>
            <FileText size={16} />
            <span>Add Form Documents</span>
          </button>
          <button type="button" className="submit-form__header-btn" onClick={handleSubmit}>
            <Save size={16} />
            <span>Save</span>
          </button>
          <button type="button" className="submit-form__header-btn" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button type="button" className="submit-form__header-btn" onClick={handleExport}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="submit-form__layout">
        {/* Main Form Container */}
        <div className="submit-form__main-content">
          <CashFlowStatement
            formData={formData}
            handleInputChange={handleInputChange}
            handleAcademicYearChange={handleAcademicYearChange}
            addTableRow={addTableRow}
            removeTableRow={removeTableRow}
            calculateTotals={calculateTotals}
            formatAsPeso={formatAsPeso}
            handleSubmit={handleSubmit}
            months={months}
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
              />
            </div>
            
        {/* Attached Documents Sidebar */}
        <div className="submit-form__sidebar">
          <AttachedDocumentsSidebar
            attachedDocuments={attachedDocuments}
            onRemoveDocument={handleRemoveAttachedDocument}
          />
          
          {/* Form Actions */}
          <div className="submit-form__actions">
                      <button
                        type="button"
              className="submit-form__action-btn submit-form__action-btn--draft"
              onClick={handleDraft}
                      >
              <Save size={16} />
              Save as Draft
                      </button>
                    <button
                      type="button"
              className="submit-form__action-btn submit-form__action-btn--submit"
              onClick={handleSubmit}
            >
              <Send size={16} />
              Submit
                      </button>
          </div>
              </div>
            </div>
            
      {/* Add Form Documents Modal */}
      <AddFormDocumentsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDocuments}
      />
    </div>
  );
};

export default SubmitForm;