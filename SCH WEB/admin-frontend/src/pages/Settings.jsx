import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Settings = () => {
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="text-secondary">{user?.email || user?.phone} — {user?.role}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Change Password</h3>

        {error && (
          <div className="admin-error-message">
            <Icon name="alertCircle" size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="admin-error-message" style={{ background: '#D1FAE5', color: '#065F46' }}>
            <Icon name="check" size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              value={passwords.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              value={passwords.newPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              value={passwords.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? <Icon name="loader" size={18} className="spinning" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
