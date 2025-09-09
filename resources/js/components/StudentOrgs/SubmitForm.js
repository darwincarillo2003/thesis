import React, { useState, useEffect } from 'react';
import { Save, Printer, Download, FileText, Send } from 'lucide-react';
import CashFlowStatement from './CashFlowStatement';
import AttachedDocumentsSidebar from './AttachedDocumentsSidebar';
import AddFormDocumentsModal from './AddFormDocumentsModal';
import SuccessNotif from '../SuccessPops/SuccessNotif';
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
      activities: [{ name: '', items: [{ description: '', amount: '' }] }],
      contingencyFund: { amount: '' },
    },
    endingCashBalance: {
      cashInBank: '',
      cashOnHand: '',
    },
    notes: [
      { 
        name: 'Organization Allocations', 
        items: [] 
      },
      { 
        name: 'Other Disbursements', 
        items: [] 
      },
      { 
        name: '1% Contingency Fund', 
        items: [] 
      }
    ]
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState([]);
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

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

  // Add new activity
  const addActivity = () => {
    setFormData(prevState => ({
      ...prevState,
      cashOutflows: {
        ...prevState.cashOutflows,
        activities: [
          ...prevState.cashOutflows.activities,
          { name: '', items: [{ description: '', amount: '' }] }
        ]
      }
    }));
  };

  // Remove activity
  const removeActivity = (activityIndex) => {
    setFormData(prevState => ({
      ...prevState,
      cashOutflows: {
        ...prevState.cashOutflows,
        activities: prevState.cashOutflows.activities.filter((_, index) => index !== activityIndex)
      }
    }));
  };

  // Add item to activity
  const addActivityItem = (activityIndex) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.cashOutflows.activities[activityIndex].items.push({ description: '', amount: '' });
      return newState;
    });
  };

  // Remove item from activity
  const removeActivityItem = (activityIndex, itemIndex) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.cashOutflows.activities[activityIndex].items.splice(itemIndex, 1);
      return newState;
    });
  };

  // Update activity name
  const updateActivityName = (activityIndex, name) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.cashOutflows.activities[activityIndex].name = name;
      return newState;
    });
  };

  // Update activity item
  const updateActivityItem = (activityIndex, itemIndex, field, value) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.cashOutflows.activities[activityIndex].items[itemIndex][field] = value;
      return newState;
    });
  };

  // Add note
  const addNote = () => {
    setFormData(prevState => ({
      ...prevState,
      notes: [
        ...prevState.notes,
        { name: '', items: [] }
      ]
    }));
  };

  // Remove note
  const removeNote = (noteIndex) => {
    setFormData(prevState => ({
      ...prevState,
      notes: prevState.notes.filter((_, index) => index !== noteIndex)
    }));
  };

  // Update note name
  const updateNoteName = (noteIndex, name) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.notes[noteIndex].name = name;
      return newState;
    });
  };

  // Add item to note
  const addNoteItem = (noteIndex) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.notes[noteIndex].items.push({ date: '', details: '', invoiceNumber: '', amount: '' });
      return newState;
    });
  };

  // Remove item from note
  const removeNoteItem = (noteIndex, itemIndex) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.notes[noteIndex].items.splice(itemIndex, 1);
      return newState;
    });
  };

  // Update note item
  const updateNoteItem = (noteIndex, itemIndex, field, value) => {
    setFormData(prevState => {
      const newState = { ...prevState };
      newState.notes[noteIndex].items[itemIndex][field] = value;
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

    // Calculate total cash outflows from activities
    const activitiesTotal = formData.cashOutflows.activities.reduce((activitySum, activity) => {
      const activityTotal = activity.items.reduce((itemSum, item) => {
        return itemSum + parseFromPeso(item.amount);
      }, 0);
      return activitySum + activityTotal;
    }, 0);

    // Calculate contingency fund
    const contingencyFund = parseFromPeso(formData.cashOutflows.contingencyFund.amount);
    
    // Calculate totals from notes for backward compatibility
    const notesTotals = formData.notes.reduce((noteAcc, note) => {
      const noteTotal = note.items.reduce((sum, item) => sum + parseFromPeso(item.amount), 0);
      noteAcc[note.name.toLowerCase().replace(/[^a-z]/g, '')] = noteTotal;
      return noteAcc;
    }, {});

    const totalCashOutflows = activitiesTotal + contingencyFund;

    // Calculate ending cash balance
    const cashInBank = parseFromPeso(formData.endingCashBalance.cashInBank);
    const cashOnHand = parseFromPeso(formData.endingCashBalance.cashOnHand);
    const totalEndingCashBalance = cashInBank + cashOnHand;

    return {
      totalCashInflows,
      totalCashOutflows,
      totalEndingCashBalance,
      activitiesTotal,
      contingencyFund,
      // For backward compatibility with notes
      organizationAllocations: notesTotals.organizationallocations || 0,
      otherDisbursements: notesTotals.otherdisbursements || 0,
      contingencyFundNotes: notesTotals.contingencyfund || 0
    };
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // API Helper function
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API call to save cash flow statement
  const saveCashFlowStatement = async (isDraft = true) => {
    setIsLoading(true);
    setError('');

    try {
      // Check if we have files to upload
      const hasFiles = attachedDocuments.some(doc => doc.file);
      console.log('Attached documents:', attachedDocuments);
      console.log('Has files to upload:', hasFiles);
      console.log('Documents with file property:', attachedDocuments.filter(doc => doc.file));
      console.log('Document types:', attachedDocuments.map(doc => ({ name: doc.name, hasFile: !!doc.file, type: typeof doc.file })));
      
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
      };

      // Use FormData if we have any attached documents (even if file check fails)
      if (hasFiles || attachedDocuments.length > 0) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        
        // Add basic form data
        formDataToSend.append('organization_name', formData.organizationName || '');
        formDataToSend.append('academic_year', academicYear || '');
        formDataToSend.append('month', formData.month || '');
        formDataToSend.append('cash_inflows', JSON.stringify(formData.cashInflows || {}));
        formDataToSend.append('cash_outflows', JSON.stringify(formData.cashOutflows || {}));
        formDataToSend.append('ending_cash_balance', JSON.stringify(formData.endingCashBalance || {}));
        
        // Add signatories
        const signatories = {
          treasurer: 'Current User',
          auditor: '',
          president: '',
          assignedAuditor: ''
        };
        formDataToSend.append('signatories', JSON.stringify(signatories));

        // Add attached form references (forms 1-7)
        const attachedFormReferences = attachedDocuments.filter(doc => doc.type === 'form');
        console.log('Attached form references:', attachedFormReferences);
        formDataToSend.append('attached_forms', JSON.stringify(attachedFormReferences));

        // Extract completed forms data from the attached documents
        const completedFormsData = {};
        attachedDocuments.forEach(doc => {
          if (doc.type === 'form' && doc.filledData) {
            completedFormsData[doc.id] = doc.filledData;
          }
        });
        console.log('Completed forms data:', completedFormsData);
        formDataToSend.append('completed_forms', JSON.stringify(completedFormsData));

        // Add supporting documents
        console.log('Processing attached documents for upload:', attachedDocuments);
        const documentsWithFiles = attachedDocuments.filter(doc => doc.file);
        console.log('Documents with files:', documentsWithFiles.length);
        
        if (documentsWithFiles.length > 0) {
          documentsWithFiles.forEach((doc, index) => {
            console.log(`Adding file ${index}:`, doc.file.name, doc.file.size, doc.file);
            formDataToSend.append(`supporting_documents[]`, doc.file);
          });
          console.log('FormData entries after adding files:');
          for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
          }
        } else {
          console.log('No documents with files found - checking all documents:', attachedDocuments);
        }

        requestBody = formDataToSend;
      } else {
        // Use JSON for requests without files
        headers['Content-Type'] = 'application/json';
        
        const signatories = {
          treasurer: 'Current User',
          auditor: '',
          president: '',
          assignedAuditor: ''
        };

        // Add attached form references for JSON requests too
        const attachedFormReferences = attachedDocuments.filter(doc => doc.type === 'form');
        
        // Extract completed forms data for JSON requests
        const completedFormsData = {};
        attachedDocuments.forEach(doc => {
          if (doc.type === 'form' && doc.filledData) {
            completedFormsData[doc.id] = doc.filledData;
          }
        });
        
        requestBody = JSON.stringify({
          organization_name: formData.organizationName || '',
          academic_year: academicYear || '',
          month: formData.month || '',
          cash_inflows: formData.cashInflows || {},
          cash_outflows: formData.cashOutflows || {},
          ending_cash_balance: formData.endingCashBalance || {},
          signatories: signatories,
          attached_forms: attachedFormReferences,
          completed_forms: completedFormsData
        });
      }

      const response = await fetch('/api/cashflow', {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        const submissionId = result.data.submission.submission_id;
        setSubmissionId(submissionId);
        setSuccessMessage(isDraft 
          ? `Cash flow statement saved as draft successfully! Submission ID: ${submissionId}` 
          : `Cash flow statement submitted successfully! Submission ID: ${submissionId}`);
        setShowSuccess(true);
        
        // Success notification will be shown via SuccessNotif component
        
        console.log('Success! Submission ID:', submissionId);
        console.log('Full response:', result);
        return result.data.submission;
      } else {
        // Show detailed validation errors if available
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(result.message || 'Failed to save cash flow statement');
        }
        console.error('API Error:', result);
        return null;
      }
    } catch (error) {
      console.error('Error saving cash flow statement:', error);
      setError('Network error occurred. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // API call to submit for approval
  const submitForApproval = async (submissionId) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cashflow/${submissionId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Cash flow statement submitted successfully and sent to COA for review!');
        setShowSuccess(true);
      } else {
        setError(result.message || 'Failed to submit cash flow statement');
      }
    } catch (error) {
      console.error('Error submitting cash flow statement:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Already submitting, please wait...');
      return;
    }
    
    // Clear any previous errors or success messages
    setError('');
    setShowSuccess(false);
    
    if (!formData.organizationName || !formData.month) {
      setError('Please fill in organization name and month before submitting.');
      return;
    }

    // Debug: Log the form data being submitted
    console.log('Submitting form data:', {
      organizationName: formData.organizationName,
      month: formData.month,
      academicYear: academicYear,
      cashInflows: formData.cashInflows,
      cashOutflows: formData.cashOutflows,
      endingCashBalance: formData.endingCashBalance
    });

    try {
      // First save as draft, then submit for approval
      const savedSubmission = await saveCashFlowStatement(false);
      if (savedSubmission) {
        await submitForApproval(savedSubmission.submission_id);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError('An error occurred during submission. Please try again.');
    }
  };

  // Handle draft save
  const handleDraft = async () => {
    // Clear any previous errors or success messages
    setError('');
    setShowSuccess(false);
    
    if (!formData.organizationName || !formData.month) {
      setError('Please fill in organization name and month before saving.');
      return;
    }

    await saveCashFlowStatement(true);
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
    console.log('New documents with files:', newDocuments.filter(doc => doc.file));
  };

  const handleRemoveAttachedDocument = (indexToRemove) => {
    setAttachedDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="submit-form">
      <div className="submit-form__header">
        <h1 className="submit-form__title">Statement of Cash Flows</h1>
        <div className="submit-form__header-actions">
          <button 
            type="button" 
            className="submit-form__header-btn" 
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            <FileText size={16} />
            <span>Add Form Documents</span>
          </button>
          <button 
            type="button" 
            className="submit-form__header-btn" 
            onClick={handleDraft}
            disabled={isLoading}
          >
            <Save size={16} />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
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
      
      {/* Error Message */}
      {error && (
        <div className="submit-form__error">
          <p>{error}</p>
          <button onClick={() => setError('')} className="submit-form__error-close">×</button>
        </div>
      )}

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
            // New activity functions
            addActivity={addActivity}
            removeActivity={removeActivity}
            addActivityItem={addActivityItem}
            removeActivityItem={removeActivityItem}
            updateActivityName={updateActivityName}
            updateActivityItem={updateActivityItem}
            // New note functions
            addNote={addNote}
            removeNote={removeNote}
            updateNoteName={updateNoteName}
            addNoteItem={addNoteItem}
            removeNoteItem={removeNoteItem}
            updateNoteItem={updateNoteItem}
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
              disabled={isLoading}
            >
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="submit-form__action-btn submit-form__action-btn--submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Send size={16} />
              {isLoading ? 'Submitting...' : 'Submit'}
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
      
      {/* Success Notification */}
      <SuccessNotif
        isVisible={showSuccess}
        message={successMessage}
        duration={5000}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default SubmitForm;