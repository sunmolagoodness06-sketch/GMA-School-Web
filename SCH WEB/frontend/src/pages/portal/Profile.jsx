import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SVGIcon from '../../components/icons/SVGIcon';
import PasswordField from '../../components/PasswordField';

const roleLabel = { student: 'Student', parent: 'Parent', staff: 'Staff', admin: 'Admin' };

const Profile = () => {
  const { user, apiCall } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const { data } = await apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
    });

    if (data.success) {
      setSuccess('Password changed successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setError(data.message || data.errors?.[0]?.msg || 'Failed to change password');
    }
    setIsSubmitting(false);
  };

  const loginIdentifier = user?.student?.regNumber || user?.email || user?.phone;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Profile</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Account</h3>
          <p><strong>Login ID:</strong> {loginIdentifier}</p>
          <p><strong>Role:</strong> {roleLabel[user?.role] || user?.role}</p>
          {user?.student && (
            <>
              <p><strong>Name:</strong> {user.student.fullName}</p>
              <p><strong>Class:</strong> {user.student.class} ({user.student.division})</p>
              <p><strong>Session:</strong> {user.student.session}</p>
            </>
          )}
          {user?.children?.length > 0 && (
            <>
              <p style={{ marginTop: 'var(--space-3)' }}><strong>Children:</strong></p>
              <ul style={{ paddingLeft: 'var(--space-6)' }}>
                {user.children.map((child) => (
                  <li key={child.id}>{child.fullName} — {child.regNumber} ({child.class}, {child.division})</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Change Password</h3>

          {error && (
            <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
              <SVGIcon name="alert-circle" size="20" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-message" style={{ marginBottom: 'var(--space-4)' }}>
              <SVGIcon name="checkCircle" size="20" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <PasswordField
                icon={false}
                name="currentPassword"
                className="form-input"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <PasswordField
                icon={false}
                name="newPassword"
                className="form-input"
                value={passwords.newPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <PasswordField
                icon={false}
                name="confirmPassword"
                className="form-input"
                value={passwords.confirmPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <SVGIcon name="loader" size="18" className="spinning" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
