import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// Import components
import Login from "./components/LoginArea/Login";
import OrgDashboard from "./components/StudentOrgs/OrgDashboard";
import Dashboard from "./components/StudentOrgs/Dashboard";
import CoaDashboard from "./components/StudentCOA/CoaDashboard";
import AuditorDashboard from "./components/AuditorArea/AuditorDashboard";
import AdminDashboard from "./components/AdminArea/AdminDashboard";


// Component to handle route protection
const ProtectedRoute = ({ children, requiredRole }) => {
  const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true';
  const hasToken = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = hasLoginFlag && hasToken;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component to handle authentication logic and routing
const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    
    // Navigate to appropriate dashboard based on role
    switch(role) {
      case 'treasurer':
        navigate('/org-dashboard');
        break;
      case 'coa':
        navigate('/coa-dashboard');
        break;
      case 'auditor':
        navigate('/auditor-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/login');
    }
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
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route 
        path="/org-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="treasurer">
            <OrgDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/coa-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="coa">
            <CoaDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/auditor-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="auditor">
            <AuditorDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          isLoggedIn && userRole ? (
            <Navigate 
              to={
                userRole === 'treasurer' ? '/org-dashboard' :
                userRole === 'coa' ? '/coa-dashboard' :
                userRole === 'auditor' ? '/auditor-dashboard' :
                userRole === 'admin' ? '/admin-dashboard' :
                '/login'
              } 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

// Mount the React App to the DOM
if (document.getElementById("root")) {
  ReactDOM.render(<App />, document.getElementById("root"));
}

export default App;
