import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'];

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const Applications = () => {
  const { apiCall } = useAuth();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async (page = 1) => {
    setIsLoading(true);
    const query = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
    const { data } = await apiCall(`/admin/applications?${query}`);
    if (data.success) {
      setApplications(data.data.applications);
      setPagination(data.data.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    const { data } = await apiCall(`/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data.success) {
      setApplications((prev) => prev.map((app) => (app._id === applicationId ? data.data : app)));
      if (selected?._id === applicationId) setSelected(data.data);
    }
    setUpdatingId(null);
  };

  const fullName = (app) => [app.applicantName.firstName, app.applicantName.middleName, app.applicantName.lastName].filter(Boolean).join(' ');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p className="text-secondary">{pagination.totalRecords || 0} total applications</p>
        </div>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
      ) : applications.length === 0 ? (
        <div className="empty-state">No applications found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application #</th>
                <th>Student</th>
                <th>Division / Class</th>
                <th>Father</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.applicationNumber}</td>
                  <td>{fullName(app)}</td>
                  <td>{app.divisionApplied} / {app.classApplied}</td>
                  <td>{app.parentInfo.father.name}<br /><span className="text-secondary text-sm">{app.parentInfo.father.phone}</span></td>
                  <td>{formatDate(app.createdAt)}</td>
                  <td>
                    <select
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`badge badge-${app.status}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(app)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline btn-sm" disabled={pagination.current <= 1} onClick={() => fetchApplications(pagination.current - 1)}>Previous</button>
          <span className="text-sm">Page {pagination.current} of {pagination.total}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.current >= pagination.total} onClick={() => fetchApplications(pagination.current + 1)}>Next</button>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{fullName(selected)}</h2>
              <button className="modal-close-btn" onClick={() => setSelected(null)}><Icon name="close" size={22} /></button>
            </div>

            <dl className="detail-grid">
              <div><dt>Application #</dt><dd>{selected.applicationNumber}</dd></div>
              <div><dt>Status</dt><dd className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</dd></div>
              <div><dt>Division</dt><dd>{selected.divisionApplied}</dd></div>
              <div><dt>Class</dt><dd>{selected.classApplied}</dd></div>
              <div><dt>Session</dt><dd>{selected.sessionApplied}</dd></div>
              <div><dt>Date of Birth</dt><dd>{formatDate(selected.dateOfBirth)}</dd></div>
              <div><dt>Gender</dt><dd>{selected.gender}</dd></div>
              <div><dt>Submitted</dt><dd>{formatDate(selected.createdAt)}</dd></div>

              <div className="detail-grid-full"><dt>Father</dt><dd>{selected.parentInfo.father.name} — {selected.parentInfo.father.phone}{selected.parentInfo.father.email ? ` — ${selected.parentInfo.father.email}` : ' (no email on file)'}</dd></div>
              <div className="detail-grid-full"><dt>Mother</dt><dd>{selected.parentInfo.mother.name} — {selected.parentInfo.mother.phone}{selected.parentInfo.mother.email ? ` — ${selected.parentInfo.mother.email}` : ''}</dd></div>

              {selected.documents?.length > 0 && (
                <div className="detail-grid-full">
                  <dt>Documents</dt>
                  <dd>
                    {selected.documents.map((doc) => (
                      <div key={doc.fileUrl}>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">{doc.type.replace('_', ' ')} — {doc.fileName}</a>
                      </div>
                    ))}
                  </dd>
                </div>
              )}

              {selected.linkedStudentId && (
                <div className="detail-grid-full"><dt>Portal Account</dt><dd>A student record and parent portal account have been created for this application.</dd></div>
              )}
            </dl>

            <div className="filter-bar">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-outline'}`}
                  disabled={updatingId === selected._id}
                  onClick={() => handleStatusChange(selected._id, s)}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
