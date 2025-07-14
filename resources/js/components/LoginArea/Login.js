import React, { useState } from 'react';
import '../../../sass/LoginAreas/Login.scss';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear any error when user starts typing again
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple validation - just check if fields are not empty
        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }
        
        // For demo purposes, allow any login or use 'admin'/'password' as default
        console.log('Login attempt:', formData);
        
        // Auto-login for testing purposes
        onLogin();
    };

    // Auto-login function for development/testing
    const handleAutoLogin = () => {
        setFormData({
            username: 'admin',
            password: 'password'
        });
        // Wait a moment then submit the form
        setTimeout(() => onLogin(), 100);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="logo-section">
                    <img 
                        src="/images/logourios.svg" 
                        alt="FSUU Logo" 
                        className="university-logo"
                    />
                    <h1 className="university-name">FATHER SATURNINO URIOS UNIVERSITY</h1>
                    <p className="university-full-name">Financial Management for Student Organizations</p>
                </div>
                
                <div className="login-form-container">
                    <h2 className="form-title">Account Login</h2>
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="input-group">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder=" "
                                className="form-input"
                                required
                                id="username"
                            />
                            <label htmlFor="username" className="input-label">USERNAME / E-MAIL</label>
                        </div>
                        
                        <div className="input-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder=" "
                                className="form-input"
                                required
                                id="password"
                            />
                            <label htmlFor="password" className="input-label">PASSWORD</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        <div className="forgot-password">
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>
                        
                        <button type="submit" className="login-button">
                            Log In
                        </button>

                        <div className="dev-login">
                            <button 
                                type="button" 
                                onClick={handleAutoLogin} 
                                className="auto-login-button"
                            >
                                Quick Login (Dev)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
