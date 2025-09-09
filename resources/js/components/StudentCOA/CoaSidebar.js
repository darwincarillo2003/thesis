import React, { useState, useEffect } from 'react';
import {
  Home,
  ClipboardCheck,
  CheckSquare,
  Settings,
  LogOut,
  Calendar
} from 'lucide-react';

const CoaSidebar = ({ isOpen, toggleSidebar, onNavigate, onLogout }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`coa-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="coa-sidebar__nav">
        <div className="coa-sidebar__logo">
          <img src="/images/coalogo.svg" alt="Commission on Audit" className="coa-sidebar__logo-image" />
        </div>
        <ul className="coa-sidebar__list">
          <li className="coa-sidebar__item">
            <div 
              className={`coa-sidebar__link ${activeItem === 'dashboard' ? 'active' : ''}`} 
              onClick={() => handleItemClick('dashboard')}
            >
              <Home size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Dashboard</span>
            </div>
          </li>
          <li className="coa-sidebar__item">
            <div
              className={`coa-sidebar__link ${activeItem === 'review-reports' ? 'active' : ''}`}
              onClick={() => handleItemClick('review-reports')}
            >
              <ClipboardCheck size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Review Reports</span>
            </div>
          </li>
          <li className="coa-sidebar__item">
            <div
              className={`coa-sidebar__link ${activeItem === 'events' ? 'active' : ''}`}
              onClick={() => handleItemClick('events')}
            >
              <Calendar size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Events</span>
            </div>
          </li>

          {/* Separator */}
          <li className="coa-sidebar__separator"></li>
          
          <li className="coa-sidebar__item">
            <div
              className={`coa-sidebar__link ${activeItem === 'settings' ? 'active' : ''}`}
              onClick={() => handleItemClick('settings')}
            >
              <Settings size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Settings</span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CoaSidebar;










