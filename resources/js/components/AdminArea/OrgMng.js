import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Search, Plus, Archive, Printer, ChevronUp, ChevronDown, Users } from 'lucide-react';
import OrgMngModal from './OrgMngModal';
import '../../../sass/AdminAreas/OrgMng.scss';

const OrgMng = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('organization_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
    
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Use the proper organizations endpoint with full data
      const response = await axios.get('/api/organizations');
      if (response.data.success) {
        setOrganizations(response.data.data || []);
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (err) {
      console.error('Fetch organizations error:', err);
      setError(`Failed to load organizations: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedIds(newSelectAll ? organizations.map(org => org.organization_id) : []);
  };

  const handleToggleRow = (id) => {
    setSelectAll(false);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderSortIcon = (field) => (
    <div className="org-mng__sort-icon">
      <ChevronUp size={14} className={`org-mng__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`org-mng__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  const handleAddOrganization = () => {
    setIsAddModalOpen(true);
  };

  const handleEditOrganization = (organization) => {
    setEditingOrganization(organization);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingOrganization(null);
  };

  const handleOrganizationSaved = () => {
    fetchOrganizations(); // Refresh the list
    handleCloseModals();
  };

  const filteredOrganizations = organizations.filter(org =>
    (org.organization_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'organization_name':
        aValue = (a.organization_name || '').toLowerCase();
        bValue = (b.organization_name || '').toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOrganizations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrganizations = sortedOrganizations.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const renderStatusBadge = () => {
    // Since basic org model doesn't have status, show as active
    return (
      <span className="org-mng__status-badge org-mng__status-badge--active">
        Active
      </span>
    );
  };

  const selectedCount = selectedIds.length;
  const allSelected = selectedIds.length === paginatedOrganizations.length && paginatedOrganizations.length > 0;

  return (
    <div className="org-mng">
      <div className="org-mng__header">
        <h1 className="org-mng__title">Organization Management</h1>
      </div>

      {isLoading && (
        <div className="org-mng__state">Loading organizations...</div>
      )}
      {error && !isLoading && (
        <div className="org-mng__state org-mng__state--error">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <div className="org-mng__tab-wrapper">
            <h2 className="org-mng__section-title">Student Organizations</h2>
          </div>
          <div className="org-mng__table-container">
          
            <div className="org-mng__controls">
              <div className="org-mng__left-controls">
                <div className="org-mng__search-bar">
                  <Search size={18} className="org-mng__search-icon" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    className="org-mng__search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <button className="org-mng__action-button org-mng__action-button--secondary">
                  <Archive size={16} />
                  Archives
                </button>
              </div>
              
              <div className="org-mng__right-controls">
                <button className="org-mng__action-button org-mng__action-button--secondary">
                  <Printer size={16} />
                  Print
                </button>
                <button 
                  className="org-mng__action-button org-mng__action-button--primary"
                  onClick={handleAddOrganization}
                >
                  <Plus size={16} />
                  Add Organization
                </button>
                {selectedCount > 0 && (
                  <button className="org-mng__action-button org-mng__action-button--danger">
                    Remove
                  </button>
                )}
              </div>
            </div>

            {selectedCount > 0 && (
              <div className="org-mng__selection-info">
                {selectedCount} Item{selectedCount > 1 ? 's' : ''} Selected
              </div>
            )}

            <div className="org-mng__table-wrapper">
              <table className="org-mng__table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="org-mng__select-all"
                        checked={allSelected}
                        onChange={handleToggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th>Actions</th>
                    <th 
                      className={`org-mng__sortable ${sortField === 'organization_name' ? `org-mng__active-sort org-mng__sort-${sortDirection}` : ''}`}
                      onClick={() => handleSort('organization_name')}
                    >
                      Organization Name
                      {renderSortIcon('organization_name')}
                    </th>
                    <th>Description</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th 
                      className={`org-mng__sortable ${sortField === 'created_at' ? `org-mng__active-sort org-mng__sort-${sortDirection}` : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Created
                      {renderSortIcon('created_at')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrganizations.map((org) => (
                    <tr key={org.organization_id}>
                      <td className="org-mng__checkbox-cell">
                        <input
                          type="checkbox"
                          className="org-mng__select-row"
                          checked={selectedIds.includes(org.organization_id)}
                          onChange={() => handleToggleRow(org.organization_id)}
                          aria-label={`Select ${org.organization_name}`}
                        />
                      </td>
                      <td className="org-mng__table-actions">
                        <div className="org-mng__action-buttons">
                          <button 
                            className="org-mng__action-btn org-mng__edit-btn" 
                            onClick={() => handleEditOrganization(org)}
                            title="Edit Organization"
                          >
                            <Edit size={16} />
                          </button>
                          <button className="org-mng__action-btn org-mng__delete-btn" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="org-mng__org-name">
                        <div className="org-mng__org-info">
                          <div className="org-mng__name">{org.organization_name}</div>
                        </div>
                      </td>
                      <td className="org-mng__description">
                        <div className="org-mng__desc-text" title={org.description || 'No description'}>
                          {org.description ? 
                            (org.description.length > 50 
                              ? `${org.description.substring(0, 50)}...` 
                              : org.description
                            ) : 'No description'
                          }
                        </div>
                      </td>
                      <td className="org-mng__member-count">
                        <div className="org-mng__member-info">
                          <Users size={14} />
                          <span>{org.users_count || 0}</span>
                        </div>
                      </td>
                      <td>{renderStatusBadge()}</td>
                      <td>{formatDate(org.created_at)}</td>
                    </tr>
                  ))}
                  {!paginatedOrganizations.length && !isLoading && (
                    <tr>
                      <td colSpan={6} className="org-mng__no-results">No organizations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - outside table-wrapper to avoid inheriting its padding */}
            {totalPages > 1 && (
              <div className="org-mng__pagination">
                <div className="org-mng__page-info">
                  Page {currentPage} of {totalPages} (Showing {paginatedOrganizations.length} of {sortedOrganizations.length} organizations)
                </div>
                <div className="org-mng__page-buttons">
                  <button
                    className="org-mng__page-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                  <button
                    className="org-mng__page-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      <OrgMngModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onOrganizationSaved={handleOrganizationSaved}
        editingOrganization={null}
      />

      <OrgMngModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onOrganizationSaved={handleOrganizationSaved}
        editingOrganization={editingOrganization}
      />
    </div>
  );
};

export default OrgMng;


