import React, { useState } from 'react';
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import '../../../sass/AuditorAreas/ReviewSubmission.scss';

const ReviewSubmission = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sample data for review submissions
  const reviewData = [
    {
      id: 1,
      organization: 'Computer Science Society',
      submissionType: 'Financial Report',
      submittedBy: 'John Doe',
      submittedDate: '2024-01-15',
      status: 'pending',
      priority: 'high',
      amount: '₱45,000',
      description: 'Q4 2023 Financial Report'
    },
    {
      id: 2,
      organization: 'Engineering Student Council',
      submissionType: 'Activity Report',
      submittedBy: 'Jane Smith',
      submittedDate: '2024-01-14',
      status: 'approved',
      priority: 'medium',
      amount: '₱25,000',
      description: 'Student Engineering Conference'
    },
    {
      id: 3,
      organization: 'Business Administration Club',
      submissionType: 'Reimbursement',
      submittedBy: 'Robert Johnson',
      submittedDate: '2024-01-13',
      status: 'rejected',
      priority: 'low',
      amount: '₱8,500',
      description: 'Office Supplies Purchase'
    },
    {
      id: 4,
      organization: 'Nursing Student Association',
      submissionType: 'Financial Report',
      submittedBy: 'Maria Garcia',
      submittedDate: '2024-01-12',
      status: 'pending',
      priority: 'high',
      amount: '₱32,000',
      description: 'Q4 2023 Nursing Program'
    },
    {
      id: 5,
      organization: 'Psychology Society',
      submissionType: 'Activity Report',
      submittedBy: 'David Wilson',
      submittedDate: '2024-01-11',
      status: 'approved',
      priority: 'medium',
      amount: '₱15,000',
      description: 'Mental Health Awareness Week'
    },
    {
      id: 6,
      organization: 'Mathematics Club',
      submissionType: 'Reimbursement',
      submittedBy: 'Sarah Brown',
      submittedDate: '2024-01-10',
      status: 'pending',
      priority: 'low',
      amount: '₱5,200',
      description: 'Competition Materials'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'rejected':
        return <XCircle size={16} className="status-icon rejected" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={14} className="priority-icon high" />;
      case 'medium':
        return <AlertTriangle size={14} className="priority-icon medium" />;
      case 'low':
        return <AlertTriangle size={14} className="priority-icon low" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredData = reviewData.filter(item => {
    const matchesSearch = item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submissionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedCount = selectedIds.length;

  const getStatusCounts = () => {
    const counts = {
      total: reviewData.length,
      pending: reviewData.filter(item => item.status === 'pending').length,
      approved: reviewData.filter(item => item.status === 'approved').length,
      rejected: reviewData.filter(item => item.status === 'rejected').length
    };
    return counts;
  };

  // Checkbox functionality
  const allSelected = selectedIds.length === filteredData.length && filteredData.length > 0;

  const handleToggleSelectAll = () => {
    const next = !(selectAll || allSelected);
    setSelectAll(next);
    setSelectedIds(next ? filteredData.map((r) => r.id) : []);
  };

  const handleToggleRow = (id) => {
    setSelectAll(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const counts = getStatusCounts();

  return (
    <div className="review-submission">
      <div className="review-submission__header">
        <h1 className="review-submission__title">Review Submissions</h1>
      </div>

      {/* Tab Wrapper with folder tab design */}
      <div className="review-submission__tab-wrapper">
        <h2 className="review-submission__section-title">Audit Report Submissions</h2>
      </div>

      {/* Table with folder tab design */}
      <div className="review-submission__table-container">
        {/* Control Bar inside container */}
        <div className="review-submission__controls">
          <div className="review-submission__left-controls">
            <div className="review-submission__search-bar">
              <Search size={18} className="review-submission__search-icon" />
              <input
                type="text"
                placeholder="Search submissions..."
                className="review-submission__search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="review-submission__right-controls">
            <select
              className="review-submission__search-input"
              style={{ width: '150px', padding: '8px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="review-submission__table-wrapper">
          <table className="review-submission__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="review-submission__select-all"
                    checked={allSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Actions</th>
                <th>Organization</th>
                <th>Submission Type</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="review-submission__checkbox-cell">
                      <input
                        type="checkbox"
                        className="review-submission__select-row"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleRow(item.id)}
                        aria-label={`Select ${item.organization}`}
                      />
                    </td>
                    <td className="review-submission__table-actions">
                      <div className="review-submission__action-buttons">
                        <button
                          className="review-submission__action-btn"
                          onClick={() => console.log('View', item.id)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{item.organization}</td>
                    <td>{item.submissionType}</td>
                    <td>{item.submittedBy}</td>
                    <td>{formatDate(item.submittedDate)}</td>
                    <td>{item.amount}</td>
                    <td>
                      <div className="review-submission__priority-badge">
                        {getPriorityIcon(item.priority)}
                        <span className={`priority-text priority-${item.priority}`}>
                          {item.priority}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="review-submission__no-results">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="review-submission__pagination">
            <div className="review-submission__page-info">
              Showing {filteredData.length} of {reviewData.length} submissions
            </div>
            <div className="review-submission__page-controls">
              <button className="review-submission__page-btn" disabled>
                Previous
              </button>
              <span className="review-submission__page-current">1</span>
              <button className="review-submission__page-btn">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmission;
