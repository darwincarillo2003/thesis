import React, { useState, useEffect } from 'react';
import {
  Home,
  FilePlus,
  FileText,
  User,
  Settings,
  LogOut
} from 'lucide-react';

const OrgSidebar = ({ isOpen, toggleSidebar, onNavigate, onLogout, activeSection }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeItem, setActiveItem] = useState(activeSection || 'dashboard');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeSection) {
      setActiveItem(activeSection);
    }
  }, [activeSection]);

  const handleItemClick = (section) => {
    setActiveItem(section);
    if (typeof onNavigate === 'function') {
      onNavigate(section);
    }
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <div className={`org-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="org-sidebar__nav">
        <div className="org-sidebar__logo">
          <img src="/images/urioslogo.svg" alt="Father Saturnino Urios University" className="org-sidebar__logo-image" />
        </div>
        <ul className="org-sidebar__list">
          <li className="org-sidebar__item">
            <div 
              className={`org-sidebar__link ${activeItem === 'dashboard' ? 'active' : ''}`} 
              onClick={() => handleItemClick('dashboard')}
            >
              <Home size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">Dashboard</span>
            </div>
          </li>
          <li className="org-sidebar__item">
            <div 
              className={`org-sidebar__link ${activeItem === 'submit-report' ? 'active' : ''}`} 
              onClick={() => handleItemClick('submit-report')}
            >
              <FilePlus size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">Submit Form</span>
            </div>
          </li>
          <li className="org-sidebar__item">
            <div 
              className={`org-sidebar__link ${activeItem === 'my-reports' ? 'active' : ''}`} 
              onClick={() => handleItemClick('my-reports')}
            >
              <FileText size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">My Reports</span>
            </div>
          </li>
          
          {/* Separator */}
          <li className="org-sidebar__separator"></li>
          
          <li className="org-sidebar__item">
            <div
              className={`org-sidebar__link ${activeItem === 'my-profile' ? 'active' : ''}`}
              onClick={() => handleItemClick('my-profile')}
            >
              <User size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">My Profile</span>
            </div>
          </li>
          <li className="org-sidebar__item">
            <div
              className={`org-sidebar__link ${activeItem === 'settings' ? 'active' : ''}`}
              onClick={() => handleItemClick('settings')}
            >
              <Settings size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">Settings</span>
            </div>
          </li>
        </ul>
      </nav>
      <div className="org-sidebar__footer">
        <button className="org-sidebar__logout-btn" onClick={handleLogout}>
          <LogOut size={18} className="org-sidebar__icon" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default OrgSidebar;
