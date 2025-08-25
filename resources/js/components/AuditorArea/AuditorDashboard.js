import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuditorSidebar from './AuditorSidebar';
import AuditorHeader from './AuditorHeader';
import AuditorDashboardMain from './AuditorDashboardMain';
import Settings from './Settings';
import ReviewSubmission from './ReviewSubmission';
import '../../../sass/AuditorAreas/AuditorDashboard.scss';
import '../../../sass/AuditorAreas/AuditorSidebar.scss';
import '../../../sass/AuditorAreas/AuditorHeader.scss';
import '../../../sass/AuditorAreas/AuditorDashboardMain.scss';
import '../../../sass/AuditorAreas/Settings.scss';
import '../../../sass/AuditorAreas/ReviewSubmission.scss';

const AuditorDashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userData, setUserData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Split the useEffects to optimize rendering
  // First useEffect for immediate UI display from localStorage
  useEffect(() => {
    // Get user data from localStorage for immediate display
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');

    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      // Set loading to false immediately if we have cached data
      setIsLoading(false);
    }

    // Set up axios authorization header
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  }, []);

  // Second useEffect for API data fetch - runs only once on component mount
  useEffect(() => {
    // Fetch fresh user data from the API
    const fetchUserData = async () => {
      try {
        // Only show loading if we don't already have user data from localStorage
        if (!userData) {
          setIsLoading(true);
        }

        const response = await axios.get('/api/user');

        if (response.data.success) {
          setUserData(response.data.data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Only show error if we don't have cached data
        if (!userData) {
          setError('Error fetching user data. Please try logging in again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Third useEffect for mobile sidebar handling
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

  // Handle profile updates from Settings component
  const handleProfileUpdate = (updatedUserData) => {
    setUserData(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Handle logout with API call
  const handleLogout = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type');

      if (token && tokenType) {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

        // Call logout API
        await axios.post('/api/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and call onLogout regardless of API success/failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('userRole');

      if (typeof onLogout === 'function') {
        onLogout();
      }
    }
  };

  // Dashboard content
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AuditorDashboardMain onLogout={onLogout} role="auditor" />;
      case 'review-submission':
        return <ReviewSubmission />;
      case 'settings':
        return <Settings />;
      default:
        return <AuditorDashboardMain onLogout={onLogout} role="auditor" />;
    }
  };

  // Only show full-screen loading if we have no cached data
  if (isLoading && !userData) {
    return (
      <div className="loader-container">
        <div className="spinner-loader"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  // Show error state
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
    <div className="org-dashboard">
      <AuditorSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        activeSection={activeSection}
        userData={userData}
      />
      <div className={`org-dashboard__wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <AuditorHeader
          toggleSidebar={toggleSidebar}
          isOpen={isSidebarOpen}
          onLogout={handleLogout}
          userData={userData}
          onNavigate={handleNavigation}
        />
        <main className="org-dashboard__content">
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

export default AuditorDashboard;
