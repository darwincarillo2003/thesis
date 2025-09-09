import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, Edit, Trash2, ChevronUp, ChevronDown, LogOut } from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ onLogout, role = 'auditor' }) => {
  // State for dashboard data
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReview: 0,
    approved: 0,
    flagged: 0
  });
  
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    
    // Load dashboard data
    fetchDashboardStats();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Refetch submissions when search, sort, or pagination changes
    fetchSubmissions();
  }, [searchTerm, sortField, sortDirection, pagination.current_page]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('/api/dashboard/student-org/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats({
          totalReports: response.data.data.total_reports,
          pendingReview: response.data.data.pending_review,
          approved: response.data.data.approved,
          flagged: response.data.data.flagged
        });
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard statistics');
    }
  };

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: searchTerm,
        sort_by: sortField,
        sort_direction: sortDirection
      });

      const response = await axios.get(`/api/dashboard/student-org/submissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const submissions = response.data.data.submissions.map(submission => ({
          id: submission.id,
          organization: submission.organization,
          submittedBy: submission.submitted_by,
          formTitle: submission.form_title,
          date: submission.date,
          formattedDate: submission.formatted_date,
          status: submission.status,
          totalAmount: submission.total_amount,
          formattedAmount: submission.formatted_amount,
          canEdit: submission.can_edit,
          canSubmit: submission.can_submit
        }));
        
        setReportsData(submissions);
        setPagination(response.data.data.pagination);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  // Delete submission
  const handleDelete = async (submissionId) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.delete(`/api/dashboard/student-org/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Refresh data
        fetchDashboardStats();
        fetchSubmissions();
      } else {
        alert('Failed to delete submission: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get status class
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'flagged':
        return 'status-flagged';
      default:
        return '';
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedItems(reportsData.map(report => report.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
      setSelectAll(false);
    } else {
      setSelectedItems([...selectedItems, id]);
      if (selectedItems.length + 1 === reportsData.length) {
        setSelectAll(true);
      }
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    // Map frontend field names to backend field names
    const fieldMapping = {
      'organization': 'submission_code', // Use submission_code for sorting as organization is nested
      'submittedBy': 'created_at', // Sort by creation date for submitted by
      'date': 'created_at',
      'status': 'status'
    };
    
    const backendField = fieldMapping[field] || field;
    
    if (sortField === backendField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(backendField);
      setSortDirection('asc');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({
        ...prev,
        current_page: newPage
      }));
    }
  };

  // Render sort icon for column headers
  const renderSortIcon = (field) => {
    return (
      <div className="sort-icon">
        <ChevronUp 
          size={14} 
          className={`sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`}
        />
        <ChevronDown 
          size={14} 
          className={`sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`}
        />
      </div>
    );
  };

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    switch(role) {
      case 'coa':
        return 'COA Dashboard';
      case 'auditor':
        return 'Auditor Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">{getDashboardTitle()}</h1>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="dashboard__error">
          <p>{error}</p>
          <button onClick={() => setError('')} className="dashboard__error-close">×</button>
        </div>
      )}
      
      <div className="dashboard__stats">
        <div className="dashboard__stat-card total">
          <p className="dashboard__stat-label">Total Reports</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{loading ? '...' : stats.totalReports}</h3>
            <div className="dashboard__stat-icon total">
              <FileText size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card pending">
          <p className="dashboard__stat-label">Pending Review</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{loading ? '...' : stats.pendingReview}</h3>
            <div className="dashboard__stat-icon pending">
              <Clock size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card approved">
          <p className="dashboard__stat-label">Approved</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{loading ? '...' : stats.approved}</h3>
            <div className="dashboard__stat-icon approved">
              <CheckCircle size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card flagged">
          <p className="dashboard__stat-label">Flagged</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{loading ? '...' : stats.flagged}</h3>
            <div className="dashboard__stat-icon flagged">
              <AlertTriangle size={32} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard__search-container">
        <div className="dashboard__search-bar">
          <Search size={18} className="dashboard__search-icon" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="dashboard__search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className="dashboard__table-container">
        <h2 className="dashboard__section-title">Liquidation Reports</h2>
        <div className="dashboard__table-wrapper">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    className="dashboard__select-all" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Actions</th>
                <th 
                  className={`sortable ${sortField === 'submission_code' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('organization')}
                >
                  Form Title
                  {renderSortIcon('organization')}
                </th>
                <th 
                  className={`sortable ${sortField === 'created_at' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('submittedBy')}
                >
                  Submitted By
                  {renderSortIcon('submittedBy')}
                </th>
                <th 
                  className={`sortable ${sortField === 'created_at' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('date')}
                >
                  Date Submitted
                  {renderSortIcon('date')}
                </th>
                <th>
                  Total Amount
                </th>
                <th 
                  className={`sortable ${sortField === 'status' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status
                  {renderSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="dashboard__no-results">Loading...</td>
                </tr>
              ) : reportsData.length > 0 ? (
                reportsData.map(report => (
                  <tr key={report.id}>
                    <td className="dashboard__checkbox-cell">
                      <input 
                        type="checkbox" 
                        className="dashboard__select-row" 
                        checked={selectedItems.includes(report.id)}
                        onChange={() => handleSelectItem(report.id)}
                      />
                    </td>
                    <td className="dashboard__table-actions">
                      <div className="dashboard__action-buttons">
                        {report.canEdit && (
                          <button className="dashboard__action-btn dashboard__edit-btn" title="Edit">
                            <Edit size={16} />
                          </button>
                        )}
                        {report.canEdit && (
                          <button 
                            className="dashboard__action-btn dashboard__delete-btn" 
                            title="Delete"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{report.formTitle || 'N/A'}</td>
                    <td>{report.submittedBy}</td>
                    <td>{report.formattedDate}</td>
                    <td>{report.formattedAmount}</td>
                    <td>
                      <span className={`dashboard__status ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="dashboard__no-results">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="dashboard__pagination">
            <div className="dashboard__page-info">
              {pagination.total > 0 ? (
                <>
                  Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
                  (Page {pagination.current_page} of {pagination.last_page})
                </>
              ) : (
                'No results'
              )}
            </div>
            <div className="dashboard__page-buttons">
              <button 
                className="dashboard__page-button" 
                disabled={pagination.current_page <= 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                Previous
              </button>
              <button 
                className="dashboard__page-button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 