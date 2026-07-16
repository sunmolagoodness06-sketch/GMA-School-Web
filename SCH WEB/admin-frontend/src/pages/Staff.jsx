import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import PasswordField from '../components/PasswordField';

const DIVISIONS = ['nursery', 'primary', 'secondary', 'college'];

const emptyForm = { email: '', phone: '', password: '', role: 'staff', division: '' };

const Staff = () => {
  const { apiCall } = useAuth();
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async (page = 1) => {
    setIsLoading(true);
    const query = new URLSearchParams({ page, limit: 20, ...(search && { search }) });
    const { data } = await apiCall(`/admin/staff?${query}`);
    if (data.success) {
      setStaff(data.data.staff);
      setPagination(data.data.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaff(1);
  };

  const handleToggleStatus = async (userId, isActive) => {
    const { data } = await apiCall(`/admin/staff/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !isActive })
    });
    if (data.success) {
      setStaff((prev) => prev.map((s) => (s._id === userId ? data.data : s)));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = { ...form, email: form.email || undefined, phone: form.phone || undefined, division: form.division || undefined };
    const { data } = await apiCall('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.success) {
      setShowForm(false);
      setForm(emptyForm);
      fetchStaff(1);
    } else {
      setFormError(data.message || data.errors?.[0]?.msg || 'Failed to create staff account');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p className="text-secondary">{pagination.totalRecords || 0} total staff/admin accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> Add Staff
        </button>
      </div>

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <input type="text" placeholder="Search by email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="search" size={16} /> Search</button>
      </form>

      {isLoading ? (
        <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
      ) : staff.length === 0 ? (
        <div className="empty-state">No staff accounts found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id}>
                  <td>{s.email || '—'}</td>
                  <td>{s.phone || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.role}</td>
                  <td><span className={`badge badge-${s.isActive ? 'approved' : 'rejected'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{s.lastLogin ? new Date(s.lastLogin).toLocaleDateString('en-GB') : 'Never'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(s._id, s.isActive)}>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline btn-sm" disabled={pagination.current <= 1} onClick={() => fetchStaff(pagination.current - 1)}>Previous</button>
          <span className="text-sm">Page {pagination.current} of {pagination.total}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.current >= pagination.total} onClick={() => fetchStaff(pagination.current + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Staff</h2>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}><Icon name="close" size={22} /></button>
            </div>

            <form onSubmit={handleCreate}>
              {formError && (
                <div className="admin-error-message">
                  <Icon name="alertCircle" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <p className="text-secondary text-sm" style={{ marginTop: '-8px', marginBottom: 'var(--space-4)' }}>
                At least one of email or phone is required — credentials are sent by SMS if a phone is given.
              </p>

              <div className="form-group">
                <label>Password</label>
                <PasswordField
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? <Icon name="loader" size={18} className="spinning" /> : 'Create Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
