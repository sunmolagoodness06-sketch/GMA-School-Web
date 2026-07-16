import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { API_BASE_URL } from '../config/api';
import Icon from '../components/Icon';

const TERMS = ['first', 'second', 'third'];

const ReportCards = () => {
  const { apiCall, token } = useAuth();
  const { confirmDialog } = useDialog();
  const [reportCards, setReportCards] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [term, setTerm] = useState('first');
  const [session, setSession] = useState('2024/2025');
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReportCards = async (page = 1) => {
    setIsLoading(true);
    const { data } = await apiCall(`/admin/report-cards?page=${page}&limit=20`);
    if (data.success) {
      setReportCards(data.data.reportCards);
      setPagination(data.data.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReportCards(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchStudents = async (value) => {
    setStudentSearch(value);
    setSelectedStudent(null);
    if (value.trim().length < 2) {
      setStudentResults([]);
      return;
    }
    const { data } = await apiCall(`/admin/students?search=${encodeURIComponent(value)}&limit=8`);
    if (data.success) setStudentResults(data.data.students);
  };

  const handleDelete = async (reportCardId) => {
    if (!(await confirmDialog('Delete this report card? This cannot be undone.', { confirmLabel: 'Delete' }))) return;
    const { data } = await apiCall(`/admin/report-cards/${reportCardId}`, { method: 'DELETE' });
    if (data.success) {
      setReportCards((prev) => prev.filter((rc) => rc._id !== reportCardId));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStudent) {
      setFormError('Select a student first');
      return;
    }
    if (!file) {
      setFormError('Choose a PDF file to upload');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('studentId', selectedStudent._id);
    formData.append('term', term);
    formData.append('session', session);
    formData.append('reportCard', file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/report-cards`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setSelectedStudent(null);
        setStudentSearch('');
        setFile(null);
        fetchReportCards(1);
      } else {
        setFormError(data.message || data.errors?.[0]?.msg || 'Failed to upload report card');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Report Cards</h1>
          <p className="text-secondary">{pagination.totalRecords || 0} uploaded</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> Upload Report Card
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
      ) : reportCards.length === 0 ? (
        <div className="empty-state">No report cards uploaded yet.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Term</th>
                <th>Session</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map((rc) => (
                <tr key={rc._id}>
                  <td>{rc.studentId?.fullName}<br /><span className="text-secondary text-sm">{rc.studentId?.regNumber}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{rc.term}</td>
                  <td>{rc.session}</td>
                  <td><a href={rc.fileUrl} target="_blank" rel="noreferrer">{rc.fileName}</a></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rc._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline btn-sm" disabled={pagination.current <= 1} onClick={() => fetchReportCards(pagination.current - 1)}>Previous</button>
          <span className="text-sm">Page {pagination.current} of {pagination.total}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.current >= pagination.total} onClick={() => fetchReportCards(pagination.current + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Report Card</h2>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}><Icon name="close" size={22} /></button>
            </div>

            <form onSubmit={handleUpload}>
              {formError && (
                <div className="admin-error-message">
                  <Icon name="alertCircle" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Student</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={selectedStudent ? selectedStudent.fullName : studentSearch}
                  onChange={(e) => searchStudents(e.target.value)}
                />
                {studentResults.length > 0 && !selectedStudent && (
                  <div className="card" style={{ padding: 0, maxHeight: 180, overflowY: 'auto' }}>
                    {studentResults.map((s) => (
                      <div
                        key={s._id}
                        style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)' }}
                        onClick={() => { setSelectedStudent(s); setStudentResults([]); }}
                      >
                        {s.fullName} — <span className="text-secondary text-sm">{s.regNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Term</label>
                  <select value={term} onChange={(e) => setTerm(e.target.value)}>
                    {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Session</label>
                  <input type="text" value={session} onChange={(e) => setSession(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Report Card PDF</label>
                <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? <Icon name="loader" size={18} className="spinning" /> : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCards;
