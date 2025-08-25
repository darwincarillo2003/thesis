import React, { useState, useEffect } from 'react';
import {
  Home,
  FileSearch,
  CheckSquare,
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';

const AuditorSidebar = ({ isOpen, toggleSidebar, onNavigate, onLogout, activeSection }) => {
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
              className={`org-sidebar__link ${activeItem === 'review-submission' ? 'active' : ''}`}
              onClick={() => handleItemClick('review-submission')}
            >
              <FileSearch size={20} className="org-sidebar__icon" />
              <span className="org-sidebar__label">Review Submission</span>
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
    </div>
  );
};

export default AuditorSidebar;