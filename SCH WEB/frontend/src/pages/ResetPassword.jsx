import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SVGIcon from '../components/icons/SVGIcon';
import AuthBranding from '../components/AuthBranding';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/login', {
        state: { message: 'Your password has been reset. Please sign in with your new password.' }
      });
    } else {
      setError(result.message || 'This reset link is invalid or has expired.');
    }
  };

  return (
    <div className="login-page">
      <AuthBranding
        title="Almost there"
        description="Choose a new password to get back into your portal."
      />

      <div className="login-form-panel">
        <div className="login-container">
          <Link to="/" className="login-form-logo">
            <SVGIcon name="graduation-cap" size={28} />
            <span>GMA School</span>
          </Link>

          <div className="login-header">
            <h1>Set a New Password</h1>
            <p>Choose a new password for your account.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <SVGIcon name="alert-circle" size="20" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <SVGIcon name="lock" size="20" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Create a new password"
                  minLength="6"
                  required
                />
              </div>
              <small className="form-help">Must be at least 6 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-with-icon">
                <SVGIcon name="lock" size="20" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Confirm your new password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SVGIcon name="loader" size="20" className="spinning" />
                  Resetting...
                </>
              ) : (
                <>
                  <SVGIcon name="checkCircle" size="20" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p><Link to="/login">Back to Sign In</Link></p>
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

export default ResetPassword;
