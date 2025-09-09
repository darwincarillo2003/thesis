import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboardMain from './AdminDashboardMain';
import UserMng from './UserMng';
import FormMng from './FormMng';
import RoleMng from './RoleMng';
import OrgMng from './OrgMng';
import Settings from './Settings';
import '../../../sass/AdminAreas/AdminDashboard.scss';
import '../../../sass/AdminAreas/AdminSidebar.scss';
import '../../../sass/AdminAreas/AdminHeader.scss';
import '../../../sass/AdminAreas/AdminDashboardMain.scss';

const AdminDashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userData, setUserData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');

    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      setIsLoading(false);
    }

    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userData) {
          setIsLoading(true);
        }
        const response = await axios.get('/api/user');
        if (response.data?.success) {
          setUserData(response.data.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (!userData) {
          setError('Error fetching user data. Please try logging in again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isSidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type');
      if (token && tokenType) {
        axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
        await axios.post('/api/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('userRole');
      if (typeof onLogout === 'function') {
        onLogout();
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboardMain />;
      case 'user-management':
        return <UserMng />;
      case 'form-management':
        return <FormMng />;
      case 'role-management':
        return <RoleMng />;
      case 'organization-management':
        return <OrgMng />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminDashboardMain />;
    }
  };

  if (isLoading && !userData) {
    return (
      <div className="loader-container">
        <div className="spinner-loader"></div>
        <p className="loading-text">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
        <button className="logout-button" onClick={onLogout}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        activeSection={activeSection}
      />
      <div className={`admin-dashboard__wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <AdminHeader
          toggleSidebar={toggleSidebar}
          isOpen={isSidebarOpen}
          onLogout={handleLogout}
          userData={userData}
          onNavigate={handleNavigation}
        />
        <main className="admin-dashboard__content">
          {renderContent()}
          {isLoading && userData && (
            <div className="content-refreshing">
              <div className="spinner-loader mini"></div>
              <span>Refreshing...</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;


