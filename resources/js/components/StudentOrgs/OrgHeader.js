import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';

const OrgHeader = ({ toggleSidebar, onLogout, userData, onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Call the onLogout function passed from parent
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleProfileClick = () => {
    if (typeof onNavigate === 'function') {
      onNavigate('settings');
    }
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    if (typeof onNavigate === 'function') {
      onNavigate('settings');
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="org-header">
      <div className="org-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} color="#0036AF" strokeWidth={2} />
      </div>

      <div className="org-header__actions">
        <div className="org-header__notification" title="Notifications">
          <Bell />
        </div>

        <div className="org-header__profile" onClick={toggleDropdown} ref={dropdownRef}>
          <img
            src={
              userData?.profile?.profile_pic 
                ? `/storage/${userData.profile.profile_pic}` 
                : "/images/csp.png"
            }
            alt={userData?.profile?.first_name || "User"}
            className="org-header__profile-picture"
            onError={(e) => {
              e.target.src = "/images/csp.png";
            }}
          />
          <span className="org-header__user-name">
            {userData ? `${userData.profile?.first_name || ''} ${userData.profile?.last_name || ''}` : 'Loading...'}
          </span>
          <ChevronDown
            className={`org-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
          />
          {isDropdownOpen && (
            <div className="org-header__dropdown-menu">
              <button className="org-header__dropdown-item" onClick={handleProfileClick}>
                <User size={16} /> Profile
              </button>
              <button className="org-header__dropdown-item" onClick={handleSettingsClick}>
                <Settings size={16} /> Settings
              </button>
              <div className="org-header__dropdown-separator"></div>
              <button className="org-header__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default OrgHeader;
