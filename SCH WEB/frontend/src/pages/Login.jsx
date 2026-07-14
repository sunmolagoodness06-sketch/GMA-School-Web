import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SVGIcon from '../components/icons/SVGIcon';
import AuthBranding from '../components/AuthBranding';
import SEO from '../components/SEO';

const REMEMBERED_EMAIL_KEY = 'gma_remembered_email';

const Login = () => {
  const [formData, setFormData] = useState({
    email: localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem(REMEMBERED_EMAIL_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/portal';

  // Set message from registration redirect
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Clear error when user starts typing
    if (message) setMessage(''); // Clear message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <SEO title="Sign In" description="Sign in to the GMA School student and parent portal." />
      <AuthBranding
        title="Welcome back"
        description="Sign in to access your grades, bills, notices, and learning resources — all in one place."
      />

      <div className="login-form-panel">
        <div className="login-container">
          <Link to="/" className="login-form-logo">
            <SVGIcon name="graduation-cap" size={28} />
            <span>GMA School</span>
          </Link>

          <div className="login-header">
            <h1>Sign In</h1>
            <p>Sign in to access your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <SVGIcon name="alert-circle" size="20" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="success-message">
                <SVGIcon name="checkCircle" size="20" />
                <span>{message}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <SVGIcon name="mail" size="20" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <SVGIcon name="lock" size="20" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SVGIcon name="loader" size="20" className="spinning" />
                  Signing in...
                </>
              ) : (
                <>
                  <SVGIcon name="log-in" size="20" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            <p className="login-footer-secondary">
              Need help? <Link to="/contact">Contact Administration</Link>
            </p>
            <Link to="/" className="back-home">
              <SVGIcon name="arrow-left" size="16" />
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
