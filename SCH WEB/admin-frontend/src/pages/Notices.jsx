import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const CATEGORIES = ['general', 'academic', 'fees', 'events', 'holidays', 'emergency', 'maintenance', 'exam', 'admission'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const DIVISIONS = ['nursery', 'primary', 'secondary', 'college', 'all'];
const ROLES = ['student', 'parent', 'staff', 'admin', 'all'];

const emptyForm = {
  title: '',
  body: '',
  category: 'general',
  priority: 'medium',
  expiryDate: '',
  targetAudience: { roles: ['all'], divisions: ['all'] }
};

const Notices = () => {
  const { apiCall } = useAuth();
  const [notices, setNotices] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [publishedFilter, setPublishedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = async (page = 1) => {
    setIsLoading(true);
    const query = new URLSearchParams({ page, limit: 20, ...(publishedFilter && { isPublished: publishedFilter }) });
    const { data } = await apiCall(`/admin/notices?${query}`);
    if (data.success) {
      setNotices(data.data.notices);
      setPagination(data.data.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedFilter]);

  const togglePublish = async (noticeId, isPublished) => {
    const { data } = await apiCall(`/admin/notices/${noticeId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished: !isPublished })
    });
    if (data.success) {
      setNotices((prev) => prev.map((n) => (n._id === noticeId ? data.data : n)));
    }
  };

  const deleteNotice = async (noticeId) => {
    if (!window.confirm('Delete this notice?')) return;
    const { data } = await apiCall(`/admin/notices/${noticeId}`, { method: 'DELETE' });
    if (data.success) {
      setNotices((prev) => prev.filter((n) => n._id !== noticeId));
    }
  };

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev.targetAudience[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, targetAudience: { ...prev.targetAudience, [field]: next } };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const { data } = await apiCall('/admin/notices', {
      method: 'POST',
      body: JSON.stringify(form)
    });

    if (data.success) {
      setShowForm(false);
      setForm(emptyForm);
      fetchNotices(1);
    } else {
      setFormError(data.message || data.errors?.[0]?.msg || 'Failed to create notice');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notices</h1>
          <p className="text-secondary">{pagination.totalRecords || 0} total notices</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> New Notice
        </button>
      </div>

      <div className="filter-bar">
        <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}>
          <option value="">All notices</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
      </div>

      {isLoading ? (
        <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
      ) : notices.length === 0 ? (
        <div className="empty-state">No notices found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{n.category}</td>
                  <td style={{ textTransform: 'capitalize' }}>{n.priority}</td>
                  <td>{new Date(n.expiryDate).toLocaleDateString('en-GB')}</td>
                  <td><span className={`badge badge-${n.isPublished ? 'approved' : 'pending'}`}>{n.isPublished ? 'Published' : 'Draft'}</span></td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => togglePublish(n._id, n.isPublished)}>
                      {n.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteNotice(n._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline btn-sm" disabled={pagination.current <= 1} onClick={() => fetchNotices(pagination.current - 1)}>Previous</button>
          <span className="text-sm">Page {pagination.current} of {pagination.total}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.current >= pagination.total} onClick={() => fetchNotices(pagination.current + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Notice</h2>
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
                <label>Title</label>
                <input type="text" required minLength={5} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Body</label>
                <textarea rows={5} required minLength={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Visible to (roles)</label>
                <div className="filter-bar" style={{ marginBottom: 0 }}>
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={`btn btn-sm ${form.targetAudience.roles.includes(r) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => toggleMulti('roles', r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Visible to (divisions)</label>
                <div className="filter-bar" style={{ marginBottom: 0 }}>
                  {DIVISIONS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      className={`btn btn-sm ${form.targetAudience.divisions.includes(d) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => toggleMulti('divisions', d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? <Icon name="loader" size={18} className="spinning" /> : 'Create Notice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
