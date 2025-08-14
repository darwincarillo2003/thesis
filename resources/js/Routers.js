import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// Import components
import Login from "./components/LoginArea/Login";
import OrgDashboard from "./components/StudentOrgs/OrgDashboard";
import Dashboard from "./components/StudentOrgs/Dashboard";
import CoaDashboard from "./components/StudentCOA/CoaDashboard";
import AdminDashboard from "./components/AdminArea/AdminDashboard";

const App = () => {
  // Initialize login state based on both isLoggedIn flag and token presence
  const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true';
  const hasToken = !!localStorage.getItem('token');
  const initialLoginState = hasLoginFlag && hasToken;
  
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoginState);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  useEffect(() => {
    // Check localStorage on component mount
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedRole = localStorage.getItem('userRole') || '';
    const token = localStorage.getItem('token');
    
    // Only consider logged in if we have both a login flag and a token
    const isActuallyLoggedIn = loginStatus && !!token;
    
    setIsLoggedIn(isActuallyLoggedIn);
    setUserRole(storedRole);
    
    // Log the login state for debugging
    console.log('App mount - Login state:', { 
      isLoggedIn: isActuallyLoggedIn, 
      role: storedRole,
      hasToken: !!token
    });
  }, []);

  const handleLogin = (role) => {
    // Store role first to ensure it is available on the first render
    if (role) {
      localStorage.setItem('userRole', role);
      setUserRole(role);
    }

    // Set login state
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    
    // Log the login action for debugging
    console.log('Login handler called with role:', role);
    console.log('Current localStorage state:', {
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      userRole: localStorage.getItem('userRole'),
      hasToken: !!localStorage.getItem('token')
    });
  };

  const handleLogout = () => {
    // Call the logout API endpoint if needed
    const token = localStorage.getItem('token');
    if (token) {
      const headers = {
        'Authorization': `${localStorage.getItem('token_type')} ${token}`
      };
      
      // Async logout - we don't wait for it to complete
      fetch('/api/logout', {
        method: 'POST',
        headers: headers
      }).catch(error => console.error('Logout error:', error));
    }
    
    // Clear all localStorage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUserRole('');
  };

  // Function to render the appropriate dashboard based on role
  const renderDashboard = () => {
    // If we're logged in but the role hasn't been populated yet, render nothing (or a small loader)
    if (!userRole) {
      return null;
    }

    switch(userRole) {
      case 'treasurer':
        return <OrgDashboard onLogout={handleLogout} />;
      case 'coa':
        return <CoaDashboard onLogout={handleLogout} />;
      case 'auditor':
        return <Dashboard onLogout={handleLogout} role={userRole} />;
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        // Unknown role: show login without performing side-effects during render
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <>
      {isLoggedIn ? (
        renderDashboard()
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
};

// Mount the React App to the DOM
if (document.getElementById("root")) {
  ReactDOM.render(<App />, document.getElementById("root"));
}

export default App;
