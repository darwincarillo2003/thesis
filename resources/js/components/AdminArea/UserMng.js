import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Search, Plus, Archive, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import AddUserModal from './AddUserModal';
import SuccessNotif from '../SuccessPops/SuccessNotif';
import '../../../sass/AdminAreas/UserMng.scss';

const placeholderImage = '/images/csp.png';

const UserMng = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          per_page: '10',
          page: currentPage.toString(),
        });
        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }
        
        const response = await axios.get(`/api/profiles?${params}`);
        const profilesData = response?.data?.data?.profiles;
        const rows = profilesData?.data || [];
        setProfiles(rows);
        setTotalPages(profilesData?.last_page || 1);
      } catch (err) {
        console.error('Fetch profiles error', err);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (!selectAll) return;
    setSelectedIds(profiles.map((p) => p.profile_id));
  }, [selectAll, profiles]);

  const allSelected = useMemo(() => {
    if (!profiles.length) return false;
    return selectedIds.length === profiles.length;
  }, [profiles.length, selectedIds.length]);

  const handleToggleSelectAll = () => {
    const next = !(selectAll || allSelected);
    setSelectAll(next);
    setSelectedIds(next ? profiles.map((p) => p.profile_id) : []);
  };

  const handleToggleRow = (id) => {
    setSelectAll(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderImage = (profile) => {
    const src = profile.image_url || profile.photo || profile.avatar || placeholderImage;
    const alt = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    return <img src={src} alt={alt} className="user-mng__avatar" />;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Reset to first page when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const renderSortIcon = (field) => (
    <div className="user-mng__sort-icon">
      <ChevronUp size={14} className={`user-mng__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`user-mng__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  const selectedCount = selectedIds.length;

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleShowSuccess = () => {
    setShowSuccessNotif(true);
  };

  const handleCloseSuccessNotif = () => {
    setShowSuccessNotif(false);
  };

  const handleUserAdded = () => {
    // Refresh the profiles list after a user is added
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          per_page: '10',
          page: currentPage.toString(),
        });
        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }
        
        const response = await axios.get(`/api/profiles?${params}`);
        const profilesData = response?.data?.data?.profiles;
        const rows = profilesData?.data || [];
        setProfiles(rows);
        setTotalPages(profilesData?.last_page || 1);
      } catch (err) {
        console.error('Fetch profiles error', err);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  };

  return (
    <div className="user-mng">
      <div className="user-mng__header">
        <h1 className="user-mng__title">User Management</h1>
      </div>

      {isLoading && (
        <div className="user-mng__state">Loading profiles...</div>
      )}
      {error && !isLoading && (
        <div className="user-mng__state user-mng__state--error">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <div className="user-mng__tab-wrapper">
            <h2 className="user-mng__section-title">User Profiles</h2>
          </div>
          <div className="user-mng__table-container">
          
          {/* Control Bar inside container */}
          <div className="user-mng__controls">
            <div className="user-mng__left-controls">
              <div className="user-mng__search-bar">
                <Search size={18} className="user-mng__search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className={`user-mng__search-input ${isSearching ? 'searching' : ''}`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {isSearching && (
                  <div className="user-mng__search-spinner">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <button className="user-mng__action-button user-mng__action-button--secondary">
                <Archive size={16} />
                Archives
              </button>
            </div>
            
            <div className="user-mng__right-controls">
              <button className="user-mng__action-button user-mng__action-button--secondary">
                <Printer size={16} />
                Print
              </button>
              <button 
                className="user-mng__action-button user-mng__action-button--primary"
                onClick={handleAddUser}
              >
                <Plus size={16} />
                Add User
              </button>
              {selectedCount > 0 && (
                <button className="user-mng__action-button user-mng__action-button--danger">
                  Remove
                </button>
              )}
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="user-mng__selection-info">
              {selectedCount} Item{selectedCount > 1 ? 's' : ''} Selected
            </div>
          )}

          <div className="user-mng__table-wrapper">
            <table className="user-mng__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="user-mng__select-all"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Actions</th>
                  <th>Image</th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'first_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('first_name')}
                  >
                    First Name
                    {renderSortIcon('first_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'middle_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('middle_name')}
                  >
                    Middle Name
                    {renderSortIcon('middle_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'last_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('last_name')}
                  >
                    Last Name
                    {renderSortIcon('last_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'suffix' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('suffix')}
                  >
                    Suffix
                    {renderSortIcon('suffix')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.profile_id}>
                    <td className="user-mng__checkbox-cell">
                      <input
                        type="checkbox"
                        className="user-mng__select-row"
                        checked={selectedIds.includes(p.profile_id)}
                        onChange={() => handleToggleRow(p.profile_id)}
                        aria-label={`Select ${p.first_name || ''} ${p.last_name || ''}`}
                      />
                    </td>
                    <td className="user-mng__table-actions">
                      <div className="user-mng__action-buttons">
                        <button className="user-mng__action-btn user-mng__edit-btn" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="user-mng__action-btn user-mng__delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{renderImage(p)}</td>
                    <td>{p.first_name || ''}</td>
                    <td>{p.middle_name || ''}</td>
                    <td>{p.last_name || ''}</td>
                    <td>{p.suffix || ''}</td>
                  </tr>
                ))}
                {!profiles.length && (
                  <tr>
                    <td colSpan={7} className="user-mng__no-results">No entries found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="user-mng__pagination">
              <div className="user-mng__page-info">Page {currentPage} of {totalPages}</div>
              <div className="user-mng__page-buttons">
                <button
                  className="user-mng__page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="user-mng__page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
      
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
        onShowSuccess={handleShowSuccess}
      />
      
      <SuccessNotif
        isVisible={showSuccessNotif}
        message="User created successfully!"
        onClose={handleCloseSuccessNotif}
      />
    </div>
  );
};

export default UserMng;

