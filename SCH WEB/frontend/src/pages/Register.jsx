import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    regNumber: '',
    studentName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Clear error when user starts typing
    if (success) setSuccess(''); // Clear success when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate required fields based on role
    if (formData.role === 'student' && !formData.regNumber) {
      setError('Registration number is required for student accounts');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'parent' && !formData.studentName) {
      setError('Student name is required for parent accounts');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          regNumber: formData.regNumber,
          studentName: formData.studentName
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please log in with your credentials.' 
            } 
          });
        }, 2000);
      } else {
        if (result.errors) {
          setError(result.errors.map(err => err.msg).join(', '));
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page"> {/* Reusing login page styles */}
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <div className="logo">
              <SVGIcon name="graduation-cap" size="48" />
              <h1>Create Portal Account</h1>
            </div>
            <p>Register to access the GMA School student portal</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <SVGIcon name="alert-circle" size="20" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <SVGIcon name="checkCircle" size="20" />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="role">Account Type</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select account type</option>
                <option value="student">Student</option>
                <option value="parent">Parent/Guardian</option>
              </select>
            </div>

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
              <small className="form-help">
                {formData.role === 'student' 
                  ? 'Use the parent email registered with the school'
                  : 'Use the email you provided to the school during admission'}
              </small>
            </div>

            {formData.role === 'student' && (
              <div className="form-group">
                <label htmlFor="regNumber">Registration Number</label>
                <div className="input-with-icon">
                  <SVGIcon name="user" size="20" />
                  <input
                    type="text"
                    id="regNumber"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    placeholder="e.g., GMA/PRI/2024/0001"
                    required
                  />
                </div>
                <small className="form-help">
                  Your student registration number (found on school documents)
                </small>
              </div>
            )}

            {formData.role === 'parent' && (
              <div className="form-group">
                <label htmlFor="studentName">Student's Full Name</label>
                <div className="input-with-icon">
                  <SVGIcon name="user" size="20" />
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter your child's full name"
                    required
                  />
                </div>
                <small className="form-help">
                  Enter your child's full name as registered with the school
                </small>
              </div>
            )}

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
                  placeholder="Create a password"
                  minLength="6"
                  required
                />
              </div>
              <small className="form-help">
                Password must be at least 6 characters long
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <SVGIcon name="lock" size="20" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
                  Creating Account...
                </>
              ) : (
                <>
                  <SVGIcon name="user" size="20" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
            <Link to="/" className="back-home">
              <SVGIcon name="arrow-left" size="16" />
              Back to Website
            </Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e40af' }}>
              <SVGIcon name="help-circle" size="20" />
              Need Help?
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <li>Students: Use your registration number and parent's email</li>
              <li>Parents: Use the email provided during admission</li>
              <li>Contact school administration if you can't find your details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;