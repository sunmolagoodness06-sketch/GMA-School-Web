import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SVGIcon from '../components/icons/SVGIcon';
import AuthBranding from '../components/AuthBranding';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await forgotPassword(email);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.message || 'Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <AuthBranding
        title="We've got you covered"
        description="Reset your password in a few quick steps and get back to your portal."
      />

      <div className="login-form-panel">
        <div className="login-container">
          <Link to="/" className="login-form-logo">
            <SVGIcon name="graduation-cap" size={28} />
            <span>GMA School</span>
          </Link>

          <div className="login-header">
            <h1>Reset Password</h1>
            <p>Enter your email and we'll send you instructions to reset your password.</p>
          </div>

          {submitted ? (
            <div className="success-message">
              <SVGIcon name="checkCircle" size="20" />
              <span>If an account exists for that email, you'll receive reset instructions shortly.</span>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <SVGIcon name="alert-circle" size="20" />
                  <span>{error}</span>
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email"
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
                    Sending...
                  </>
                ) : (
                  <>
                    <SVGIcon name="mail" size="20" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

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

export default ForgotPassword;
