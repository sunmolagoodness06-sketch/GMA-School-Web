import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import SVGIcon from '../../components/icons/SVGIcon';

const CATEGORIES = ['all', 'general', 'academic', 'fees', 'events', 'holidays', 'emergency', 'maintenance', 'exam', 'admission'];

const Notices = () => {
  const { user, apiCall } = useAuth();
  const { selectedChildId } = useSelectedChild();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const requestIdRef = useRef(0);

  const fetchNotices = async () => {
    if (!selectedChildId) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError('');
    const { data } = await apiCall(`/student/${selectedChildId}/notices?category=${category}`);
    if (requestId !== requestIdRef.current) return;
    if (data.success) {
      setNotices(data.data);
    } else {
      setError(data.message || 'Failed to load notices');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, category]);

  const hasRead = (notice) => notice.readBy?.some((r) => r.user === user?.id);
  const hasAcknowledged = (notice) => notice.acknowledgedBy?.some((a) => a.user === user?.id);

  const toggleExpand = async (notice) => {
    const opening = expandedId !== notice._id;
    setExpandedId(opening ? notice._id : null);

    if (opening && !hasRead(notice)) {
      await apiCall(`/student/notices/${notice._id}/read`, { method: 'POST' });
      setNotices((prev) => prev.map((n) => (n._id === notice._id ? { ...n, readBy: [...(n.readBy || []), { user: user.id }] } : n)));
    }
  };

  const handleAcknowledge = async (notice) => {
    const { data } = await apiCall(`/student/notices/${notice._id}/acknowledge`, { method: 'POST' });
    if (data.success) {
      setNotices((prev) => prev.map((n) => (n._id === notice._id ? { ...n, acknowledgedBy: [...(n.acknowledgedBy || []), { user: user.id }] } : n)));
    }
  };

  if (!selectedChildId) {
    return (
      <div className="dashboard">
        <div className="card">
          <div className="card-body">
            <p>Select a student to view notices.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>School Notices</h1>
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 240, marginBottom: 'var(--space-5)' }}>
        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
          <SVGIcon name="alert-circle" size="20" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="dashboard-loading">
          <SVGIcon name="loader" size="48" className="spinning" />
          <p>Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <SVGIcon name="bell-off" size="48" />
            <p>No notices right now.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {notices.map((notice) => {
              const isExpanded = expandedId === notice._id;
              const read = hasRead(notice);
              return (
                <div key={notice._id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <button
                    onClick={() => toggleExpand(notice)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-4) var(--space-5)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: 'inherit'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <SVGIcon name="bell" size="20" />
                      <div>
                        <strong style={{ fontWeight: read ? 500 : 700 }}>{notice.title}</strong>
                        <div className="text-secondary" style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                          {notice.category} · {notice.priority} priority · {new Date(notice.publishDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                    <SVGIcon name={isExpanded ? 'chevronDown' : 'chevronRight'} size="18" />
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{notice.body}</p>
                      {notice.acknowledgmentRequired && (
                        hasAcknowledged(notice) ? (
                          <span className="success-message" style={{ display: 'inline-flex' }}>
                            <SVGIcon name="checkCircle" size="16" /> Acknowledged
                          </span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAcknowledge(notice)}>
                            Acknowledge
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
