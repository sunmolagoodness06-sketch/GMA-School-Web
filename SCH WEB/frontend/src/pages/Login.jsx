import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SVGIcon from '../components/icons/SVGIcon';
import AuthBranding from '../components/AuthBranding';
import SEO from '../components/SEO';
import PasswordField from '../components/PasswordField';

const REMEMBERED_EMAIL_KEY = 'gma_remembered_identifier';

const ACCOUNT_TYPES = [
  { value: 'parent', label: 'Parent', icon: 'users' },
  { value: 'student', label: 'Student', icon: 'graduation-cap' },
  { value: 'staff', label: 'Staff', icon: 'briefcase' }
];

const Login = () => {
  const [formData, setFormData] = useState({
    role: 'parent',
    identifier: localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
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

    const result = await login(formData.identifier, formData.password, formData.role);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.identifier);
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
              <label>I am a</label>
              <div className="role-toggle">
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`role-toggle-option ${formData.role === type.value ? 'role-toggle-option-active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: type.value })}
                  >
                    <SVGIcon name={type.icon} size="18" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="identifier">{formData.role === 'student' ? 'Registration Number' : 'Email or Phone Number'}</label>
              <div className="input-with-icon">
                <SVGIcon name={formData.role === 'student' ? 'graduation-cap' : 'mail'} size="20" />
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder={formData.role === 'student' ? 'e.g. GMA/PRI/2024/0001' : 'Enter your email or phone number'}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <PasswordField
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
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
            <p>New to GMA School? <Link to="/admissions">Start an Application</Link></p>
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
