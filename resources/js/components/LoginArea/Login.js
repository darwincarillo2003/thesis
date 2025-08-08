import React, { useState, useEffect } from 'react';
import '../../../sass/LoginAreas/Login.scss';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Set logo as loaded after a small delay to ensure animation plays
        const timer = setTimeout(() => {
            setLogoLoaded(true);
        }, 100);
        
        // Simulate loading time for the loader animation
        const loaderTimer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        
        return () => {
            clearTimeout(timer);
            clearTimeout(loaderTimer);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear any error when user starts typing again
        if (error) setError('');
        // Clear field error for this specific input
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation - just check if fields are not empty
        const newFieldErrors = {};
        if (!formData.email) newFieldErrors.email = 'Email is required';
        if (!formData.password) newFieldErrors.password = 'Password is required';
        
        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            setError('Please enter both email and password');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Enable console logging for network requests
            console.log('Sending login request...');
            
            // Call the login API endpoint
            const response = await axios.post('/api/login', {
                email: formData.email,
                password: formData.password
            });
            
            // Log the full response for debugging
            console.log('Login response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers
            });
            
            if (response.data.success) {
                // Show success message but don't wait for it to be displayed
                // The state update will happen but we won't delay redirection
                setSuccess('Login successful!');
                setError('');
                
                // Log success to console
                console.log(`Login successful! Status: ${response.status} ${response.statusText}`);
                
                // Store user data and token in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                localStorage.setItem('token', response.data.data.access_token);
                localStorage.setItem('token_type', response.data.data.token_type);
                
                // Set login status to true - IMPORTANT for redirection
                localStorage.setItem('isLoggedIn', 'true');
                
                // Handle role-based redirection
                const userRole = response.data.data.user.role.role_name;
                
                // Store the role in localStorage for future reference
                localStorage.setItem('userRole', userRole);
                
                // Set axios default headers for future requests
                axios.defaults.headers.common['Authorization'] = `${response.data.data.token_type} ${response.data.data.access_token}`;
                
                // Log user role for debugging
                console.log(`User role: ${userRole}. Redirecting immediately...`);
                
                // Call the onLogin function immediately to prevent redirection issues
                // No timeout to ensure the state changes right away
                onLogin(userRole);
            } else {
                setError('Login failed. Please try again.');
                setSuccess('');
                console.warn('Login failed: Server returned success: false');
            }
        } catch (err) {
            console.error('Login error:', err);
            
            // Enhanced error logging
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers
                });
                const errorMsg = err.response.data.message || 'Invalid login credentials';
                setError(errorMsg);
                
                // Set field-specific errors
                const newFieldErrors = {};
                if (errorMsg.toLowerCase().includes('email')) {
                    newFieldErrors.email = 'Invalid email';
                }
                if (errorMsg.toLowerCase().includes('password') || !errorMsg.toLowerCase().includes('email')) {
                    newFieldErrors.password = 'Invalid password';
                }
                setFieldErrors(newFieldErrors);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
                setError('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request error:', err.message);
                setError('Network error. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (isLoading) {
        return (
            <div className="loader-container">
                <div className="spinner-loader"></div>
                <p className="loading-text">Loading</p>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="logo-section">
                    <img 
                        src="/images/logourios.svg" 
                        alt="FSUU Logo" 
                        className={`university-logo ${logoLoaded ? 'logo-loaded' : ''}`}
                        onLoad={() => setLogoLoaded(true)}
                    />
                    <h1 className="university-name">FATHER SATURNINO URIOS UNIVERSITY</h1>
                    <p className="university-full-name">Student Organization Liquidation System</p>
                </div>
                
                <div className="login-form-container">
                    <h2 className="form-title">Account Login</h2>
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && Object.keys(fieldErrors).length === 0 && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <div className="input-group">
                            <div className="input-control">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    className={`form-input ${fieldErrors.email ? 'error-input' : ''}`}
                                    required
                                    id="email"
                                />
                                <label htmlFor="email" className="input-label">EMAIL</label>
                            </div>
                            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                        </div>
                        
                        <div className="input-group password-group">
                            <div className="input-control">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    className={`form-input ${fieldErrors.password ? 'error-input' : ''}`}
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
                            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                        </div>
                        
                        <div className="forgot-password">
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
