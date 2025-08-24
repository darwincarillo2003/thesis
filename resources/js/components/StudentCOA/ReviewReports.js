import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Flag, AlertCircle, Search, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import ReviewModal from './ReviewModal';

const ReviewReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize with sample data for now (will be replaced with API data)
  const [sampleReports] = useState([
    {
      id: 1,
      orgName: 'Student Council',
      reportType: 'Statement of Cashflows',
      submissionDate: '2024-01-15',
      status: 'pending',
      amount: '₱25,000.00',
      academicYear: '2023-2024',
      month: 'January',
      formData: {
        organizationName: 'Student Council',
        cashInflows: {
          beginningCashInBank: { month: 'December', amount: '₱15,000.00' },
          beginningCashOnHand: { month: 'December', amount: '₱2,000.00' },
          cashReceiptSources: [
            { description: 'Membership Fees', amount: '₱8,000.00' }
          ]
        },
        cashOutflows: {
          organizationAllocations: [
            { date: '2024-01-10', details: 'Event Supplies', invoiceNumber: 'INV-001', amount: '₱5,000.00' }
          ],
          otherDisbursements: [
            { date: '2024-01-12', details: 'Transportation', invoiceNumber: 'REC-002', amount: '₱1,500.00' }
          ],
          contingencyFund: []
        },
        endingCashBalance: {
          cashInBank: '₱18,500.00',
          cashOnHand: '₱0.00'
        }
      },
      documents: [
        { name: 'Bank Statement - January 2024.pdf', type: 'bank_statement', size: '2.4 MB' },
        { name: 'Receipt - Event Supplies.jpg', type: 'receipt', size: '1.2 MB' },
        { name: 'Official Receipt - Transportation.pdf', type: 'receipt', size: '856 KB' }
      ]
    },
    {
      id: 2,
      orgName: 'Engineering Society',
      reportType: 'Statement of Cashflows',
      submissionDate: '2024-01-12',
      status: 'approved',
      amount: '₱18,500.00',
      academicYear: '2023-2024',
      month: 'January',
      formData: {
        organizationName: 'Engineering Society',
        cashInflows: {
          beginningCashInBank: { month: 'December', amount: '₱12,000.00' },
          beginningCashOnHand: { month: 'December', amount: '₱1,500.00' },
          cashReceiptSources: [
            { description: 'Workshop Fees', amount: '₱5,000.00' }
          ]
        },
        cashOutflows: {
          organizationAllocations: [
            { date: '2024-01-08', details: 'Workshop Materials', invoiceNumber: 'INV-003', amount: '₱3,000.00' }
          ],
          otherDisbursements: [],
          contingencyFund: []
        },
        endingCashBalance: {
          cashInBank: '₱15,500.00',
          cashOnHand: '₱0.00'
        }
      },
      documents: [
        { name: 'Bank Statement - January 2024.pdf', type: 'bank_statement', size: '2.1 MB' },
        { name: 'Workshop Materials Invoice.pdf', type: 'invoice', size: '943 KB' }
      ]
    },
    {
      id: 3,
      orgName: 'Business Club',
      reportType: 'Statement of Cashflows',
      submissionDate: '2024-01-10',
      status: 'flagged',
      amount: '₱32,750.00',
      academicYear: '2023-2024',
      month: 'January',
      formData: {
        organizationName: 'Business Club',
        cashInflows: {
          beginningCashInBank: { month: 'December', amount: '₱20,000.00' },
          beginningCashOnHand: { month: 'December', amount: '₱5,000.00' },
          cashReceiptSources: [
            { description: 'Seminar Fees', amount: '₱12,000.00' }
          ]
        },
        cashOutflows: {
          organizationAllocations: [
            { date: '2024-01-05', details: 'Venue Rental', invoiceNumber: 'INV-004', amount: '₱8,000.00' }
          ],
          otherDisbursements: [
            { date: '2024-01-07', details: 'Catering Services', invoiceNumber: 'REC-005', amount: '₱6,250.00' }
          ],
          contingencyFund: []
        },
        endingCashBalance: {
          cashInBank: '₱22,750.00',
          cashOnHand: '₱0.00'
        }
      },
      documents: [
        { name: 'Bank Statement - January 2024.pdf', type: 'bank_statement', size: '2.8 MB' },
        { name: 'Venue Rental Contract.pdf', type: 'contract', size: '1.5 MB' }
      ]
    },
    {
      id: 4,
      orgName: 'Arts & Letters Guild',
      reportType: 'Statement of Cashflows',
      submissionDate: '2024-01-08',
      status: 'unliquidated',
      amount: '₱15,200.00',
      academicYear: '2023-2024',
      month: 'January',
      formData: {
        organizationName: 'Arts & Letters Guild',
        cashInflows: {
          beginningCashInBank: { month: 'December', amount: '₱10,000.00' },
          beginningCashOnHand: { month: 'December', amount: '₱1,200.00' },
          cashReceiptSources: [
            { description: 'Art Exhibition Fees', amount: '₱4,000.00' }
          ]
        },
        cashOutflows: {
          organizationAllocations: [
            { date: '2024-01-06', details: 'Art Supplies', invoiceNumber: 'INV-006', amount: '₱3,500.00' }
          ],
          otherDisbursements: [],
          contingencyFund: []
        },
        endingCashBalance: {
          cashInBank: '₱11,700.00',
          cashOnHand: '₱0.00'
        }
      },
      documents: [
        { name: 'Bank Statement - January 2024.pdf', type: 'bank_statement', size: '1.9 MB' },
        { name: 'Art Supplies Receipt.jpg', type: 'receipt', size: '1.1 MB' }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState('orgName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch cash flow statements from API
  useEffect(() => {
    fetchCashFlowStatements();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchCashFlowStatements = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cashflow/coa-review', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('COA Review API Response:', result);

      if (result.success) {
        // Handle both paginated and non-paginated data
        const submissions = result.data.submissions?.data || result.data.submissions || [];
        console.log('Submissions found:', submissions);
        
        // Transform API data to match expected format
        const transformedReports = submissions.map(submission => ({
          id: submission.submission_id,
          orgName: submission.form_data?.organization_name || 'Unknown Organization',
          reportType: 'Statement of Cashflows',
          submissionDate: new Date(submission.created_at).toISOString().split('T')[0],
          status: submission.status,
          amount: `₱${parseFloat(submission.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}`,
          academicYear: submission.form_data?.academic_year || '',
          month: submission.form_data?.month || '',
          submissionCode: submission.submission_code,
          submittedBy: submission.submitter?.profile?.first_name + ' ' + submission.submitter?.profile?.last_name || submission.submitter?.email || 'Unknown',
          formData: {
            organizationName: submission.form_data?.organization_name || '',
            cashInflows: submission.form_data?.cash_inflows || {},
            cashOutflows: submission.form_data?.cash_outflows || {},
            endingCashBalance: submission.form_data?.ending_cash_balance || {},
            signatories: submission.form_data?.signatories || {},
            attached_forms: submission.form_data?.attached_forms || [],
            completed_forms: submission.form_data?.completed_forms || {}
          },
          documents: submission.documents || [],
          signatures: submission.signatures || [],
          currentApprover: submission.current_approver,
          workflowStep: submission.workflow_step
        }));

        setReports(transformedReports);
        
        // If no API data, fallback to sample data for development
        if (transformedReports.length === 0) {
          setReports(sampleReports);
        }
      } else {
        setError(result.message || 'Failed to fetch cash flow statements');
        // Fallback to sample data
        setReports(sampleReports);
      }
    } catch (error) {
      console.error('Error fetching cash flow statements:', error);
      setError('Network error occurred. Using sample data.');
      // Fallback to sample data
      setReports(sampleReports);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-badge status-badge--approved';
      case 'flagged':
        return 'status-badge status-badge--flagged';
      case 'unliquidated':
        return 'status-badge status-badge--unliquidated';
      default:
        return 'status-badge status-badge--pending';
    }
  };

  const handleViewReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleFlagReport = (reportId) => {
    // Handle flag action
    console.log('Flagging report:', reportId);
    // Update report status
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId ? { ...report, status: 'flagged' } : report
      )
    );
  };

  const handleMarkUnliquidated = (reportId) => {
    // Handle unliquidated action
    console.log('Marking report as unliquidated:', reportId);
    // Update report status
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId ? { ...report, status: 'unliquidated' } : report
      )
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleReviewComplete = (reportId, decision, comments) => {
    // Update the reports list to reflect the new status
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: decision === 'approve' ? 'approved' : decision === 'flag' ? 'flagged' : 'unliquidated'
            }
          : report
      )
    );
    
    // Optionally refresh the data from server
    // fetchCashFlowStatements();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Checkbox functionality
  const allSelected = useMemo(() => {
    if (!reports.length) return false;
    return selectedIds.length === reports.length;
  }, [reports.length, selectedIds.length]);

  const handleToggleSelectAll = () => {
    const next = !(selectAll || allSelected);
    setSelectAll(next);
    setSelectedIds(next ? reports.map((r) => r.id) : []);
  };

  const handleToggleRow = (id) => {
    setSelectAll(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Sorting functionality
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => (
    <div className="review-reports__sort-icon">
      <ChevronUp size={14} className={`review-reports__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`review-reports__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter(report =>
      report.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort reports
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [reports, searchTerm, sortField, sortDirection]);

  const selectedCount = selectedIds.length;

  const handlePrint = () => {
    // Print functionality similar to UserMng
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Review Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0036AF; padding-bottom: 20px; }
          .header h1 { color: #0036AF; margin: 0; font-size: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0036AF; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Review Reports</h1>
          <p>Commission on Audit</p>
          <p>Generated on: ${currentDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Report Type</th>
              <th>Submission Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedReports.map(report => `
              <tr>
                <td>${report.orgName}</td>
                <td>${report.reportType}</td>
                <td>${report.submissionDate}</td>
                <td>${report.amount}</td>
                <td>${report.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (isLoading) {
    return (
      <div className="review-reports">
        <div className="review-reports__loading">
          <p>Loading cash flow statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-reports">
      <div className="review-reports__header">
        <h1 className="review-reports__title">Review Reports</h1>
      </div>

      {error && (
        <div className="review-reports__error">
          <p>{error}</p>
          <button onClick={() => setError('')} className="review-reports__error-close">×</button>
        </div>
      )}

      <div className="review-reports__tab-wrapper">
        <h2 className="review-reports__section-title">Statement of Cashflows Reports</h2>
      </div>
      
      <div className="review-reports__table-container">
        {/* Control Bar inside container */}
        <div className="review-reports__controls">
          <div className="review-reports__left-controls">
            <div className="review-reports__search-bar">
              <Search size={18} className="review-reports__search-icon" />
              <input
                type="text"
                placeholder="Search reports..."
                className="review-reports__search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="review-reports__right-controls">
            <button 
              className="review-reports__action-button review-reports__action-button--secondary"
              onClick={handlePrint}
              title="Print Reports"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="review-reports__selection-info">
            {selectedCount} Item{selectedCount > 1 ? 's' : ''} Selected
          </div>
        )}

        <div className="review-reports__table-wrapper">
          <table className="review-reports__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="review-reports__select-all"
                    checked={allSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Actions</th>
                <th 
                  className={`review-reports__sortable ${sortField === 'orgName' ? `review-reports__active-sort review-reports__sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('orgName')}
                >
                  Organization
                  {renderSortIcon('orgName')}
                </th>
                <th 
                  className={`review-reports__sortable ${sortField === 'reportType' ? `review-reports__active-sort review-reports__sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('reportType')}
                >
                  Report Type
                  {renderSortIcon('reportType')}
                </th>
                <th 
                  className={`review-reports__sortable ${sortField === 'submissionDate' ? `review-reports__active-sort review-reports__sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('submissionDate')}
                >
                  Submission Date
                  {renderSortIcon('submissionDate')}
                </th>
                <th 
                  className={`review-reports__sortable ${sortField === 'amount' ? `review-reports__active-sort review-reports__sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  {renderSortIcon('amount')}
                </th>
                <th 
                  className={`review-reports__sortable ${sortField === 'status' ? `review-reports__active-sort review-reports__sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status
                  {renderSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReports.map((report) => (
                <tr key={report.id}>
                  <td className="review-reports__checkbox-cell">
                    <input
                      type="checkbox"
                      className="review-reports__select-row"
                      checked={selectedIds.includes(report.id)}
                      onChange={() => handleToggleRow(report.id)}
                      aria-label={`Select ${report.orgName}`}
                    />
                  </td>
                  <td className="review-reports__table-actions">
                    <div className="review-reports__action-buttons">
                      <button
                        className="review-reports__action-btn review-reports__view-btn"
                        onClick={() => handleViewReport(report.id)}
                        title="View & Review Report"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="review-reports__action-btn review-reports__flag-btn"
                        onClick={() => handleFlagReport(report.id)}
                        title="Flag for Review"
                      >
                        <Flag size={16} />
                      </button>
                      <button
                        className="review-reports__action-btn review-reports__unliquidated-btn"
                        onClick={() => handleMarkUnliquidated(report.id)}
                        title="Mark as Unliquidated"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </td>
                  <td>{report.orgName}</td>
                  <td>{report.reportType}</td>
                  <td>{report.submissionDate}</td>
                  <td>{report.amount}</td>
                  <td>
                    <span className={getStatusBadgeClass(report.status)}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredAndSortedReports.length && (
                <tr>
                  <td colSpan={7} className="review-reports__no-results">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={selectedReport}
        onReviewComplete={handleReviewComplete}
      />
    </div>
  );
};

export default ReviewReports;
