import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Search, Plus, Archive, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import RoleMngModal from './RoleMngModal';
import '../../../sass/AdminAreas/RoleMng.scss';

const RoleMng = () => {
  const [roles, setRoles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('role_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
    
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/roles');
      if (response.data.success) {
        setRoles(response.data.data || []);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
      setError('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedIds(newSelectAll ? roles.map(role => role.role_id) : []);
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
    <div className="role-mng__sort-icon">
      <ChevronUp size={14} className={`role-mng__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`role-mng__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'role_name':
        aValue = a.role_name?.toLowerCase() || '';
        bValue = b.role_name?.toLowerCase() || '';
        break;
      case 'description':
        aValue = a.description?.toLowerCase() || '';
        bValue = b.description?.toLowerCase() || '';
        break;
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
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
  const totalPages = Math.ceil(sortedRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoles = sortedRoles.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const handleAddRole = () => {
    setIsAddModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  const handleRoleSaved = () => {
    fetchRoles(); // Refresh the list
    handleCloseModals();
  };

  const selectedCount = selectedIds.length;
  const allSelected = selectedIds.length === paginatedRoles.length && paginatedRoles.length > 0;

  return (
    <div className="role-mng">
      <div className="role-mng__header">
        <h1 className="role-mng__title">Role Management</h1>
      </div>

      {isLoading && (
        <div className="role-mng__state">Loading roles...</div>
      )}
      {error && !isLoading && (
        <div className="role-mng__state role-mng__state--error">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <div className="role-mng__tab-wrapper">
            <h2 className="role-mng__section-title">System Roles</h2>
          </div>
          <div className="role-mng__table-container">
          
            <div className="role-mng__controls">
              <div className="role-mng__left-controls">
                <div className="role-mng__search-bar">
                  <Search size={18} className="role-mng__search-icon" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    className="role-mng__search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <button className="role-mng__action-button role-mng__action-button--secondary">
                  <Archive size={16} />
                  Archives
                </button>
              </div>
              
              <div className="role-mng__right-controls">
                <button className="role-mng__action-button role-mng__action-button--secondary">
                  <Printer size={16} />
                  Print
                </button>
                <button 
                  className="role-mng__action-button role-mng__action-button--primary"
                  onClick={handleAddRole}
                >
                  <Plus size={16} />
                  Add Role
                </button>
                {selectedCount > 0 && (
                  <button className="role-mng__action-button role-mng__action-button--danger">
                    Remove
                  </button>
                )}
              </div>
            </div>

            {selectedCount > 0 && (
              <div className="role-mng__selection-info">
                {selectedCount} Item{selectedCount > 1 ? 's' : ''} Selected
              </div>
            )}

            <div className="role-mng__table-wrapper">
              <table className="role-mng__table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="role-mng__select-all"
                        checked={allSelected}
                        onChange={handleToggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th>Actions</th>
                    <th 
                      className={`role-mng__sortable ${sortField === 'role_name' ? `role-mng__active-sort role-mng__sort-${sortDirection}` : ''}`}
                      onClick={() => handleSort('role_name')}
                    >
                      Role Name
                      {renderSortIcon('role_name')}
                    </th>
                    <th 
                      className={`role-mng__sortable ${sortField === 'description' ? `role-mng__active-sort role-mng__sort-${sortDirection}` : ''}`}
                      onClick={() => handleSort('description')}
                    >
                      Description
                      {renderSortIcon('description')}
                    </th>
                    <th 
                      className={`role-mng__sortable ${sortField === 'created_at' ? `role-mng__active-sort role-mng__sort-${sortDirection}` : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Created
                      {renderSortIcon('created_at')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.map((role) => (
                    <tr key={role.role_id}>
                      <td className="role-mng__checkbox-cell">
                        <input
                          type="checkbox"
                          className="role-mng__select-row"
                          checked={selectedIds.includes(role.role_id)}
                          onChange={() => handleToggleRow(role.role_id)}
                          aria-label={`Select ${role.role_name}`}
                        />
                      </td>
                      <td className="role-mng__table-actions">
                        <div className="role-mng__action-buttons">
                          <button 
                            className="role-mng__action-btn role-mng__edit-btn" 
                            onClick={() => handleEditRole(role)}
                            title="Edit Role"
                          >
                            <Edit size={16} />
                          </button>
                          <button className="role-mng__action-btn role-mng__delete-btn" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="role-mng__role-name">{role.role_name}</td>
                      <td className="role-mng__description">{role.description || 'No description'}</td>
                      <td>{formatDate(role.created_at)}</td>
                    </tr>
                  ))}
                  {!paginatedRoles.length && !isLoading && (
                    <tr>
                      <td colSpan={5} className="role-mng__no-results">No roles found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - outside table-wrapper to avoid inheriting its padding */}
            {totalPages > 1 && (
              <div className="role-mng__pagination">
                <div className="role-mng__page-info">
                  Page {currentPage} of {totalPages} (Showing {paginatedRoles.length} of {sortedRoles.length} roles)
                </div>
                <div className="role-mng__page-buttons">
                  <button
                    className="role-mng__page-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                  <button
                    className="role-mng__page-button"
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
      
      <RoleMngModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onRoleSaved={handleRoleSaved}
        editingRole={null}
      />

      <RoleMngModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onRoleSaved={handleRoleSaved}
        editingRole={editingRole}
      />
    </div>
  );
};

export default RoleMng;


