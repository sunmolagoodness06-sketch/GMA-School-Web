import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const DIVISIONS = ['nursery', 'primary', 'secondary', 'college'];

const emptyForm = {
  fullName: '',
  division: '',
  class: '',
  session: '2024/2025',
  dateOfBirth: '',
  gender: '',
  parentInfo: { name: '', email: '', phone: '', relationship: 'father', address: '' },
  emergencyContact: { name: '', phone: '', relationship: '' },
  createParentAccount: true
};

const Students = () => {
  const { apiCall } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);

  const fetchStudents = async (page = 1) => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page, limit: 20,
      ...(divisionFilter && { division: divisionFilter }),
      ...(search && { search })
    });
    const { data } = await apiCall(`/admin/students?${query}`);
    if (data.success) {
      setStudents(data.data.students);
      setPagination(data.data.pagination);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const updateField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        next[parent] = { ...next[parent], [child]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const { data } = await apiCall('/admin/students', {
      method: 'POST',
      body: JSON.stringify(form)
    });

    if (data.success) {
      setShowForm(false);
      setForm(emptyForm);
      setCreatedStudent(data.data);
      fetchStudents(1);
    } else {
      setFormError(data.message || data.errors?.[0]?.msg || 'Failed to create student');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p className="text-secondary">{pagination.totalRecords || 0} total students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> Add Student
        </button>
      </div>

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
          <option value="">All divisions</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="search" size={16} /> Search</button>
      </form>

      {isLoading ? (
        <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
      ) : students.length === 0 ? (
        <div className="empty-state">No students found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg Number</th>
                <th>Name</th>
                <th>Division / Class</th>
                <th>Parent Contact</th>
                <th>Portal Account</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.regNumber}</td>
                  <td>{s.fullName}</td>
                  <td>{s.division} / {s.class}</td>
                  <td>{s.parentInfo.name}<br /><span className="text-secondary text-sm">{s.parentInfo.phone}</span></td>
                  <td><span className={`badge badge-${s.userId?.isActive ? 'approved' : 'rejected'}`}>{s.userId?.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline btn-sm" disabled={pagination.current <= 1} onClick={() => fetchStudents(pagination.current - 1)}>Previous</button>
          <span className="text-sm">Page {pagination.current} of {pagination.total}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.current >= pagination.total} onClick={() => fetchStudents(pagination.current + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Student</h2>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}><Icon name="close" size={22} /></button>
            </div>

            <form onSubmit={handleCreateStudent}>
              {formError && (
                <div className="admin-error-message">
                  <Icon name="alertCircle" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Division</label>
                  <select required value={form.division} onChange={(e) => updateField('division', e.target.value)}>
                    <option value="">Select division</option>
                    {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <input type="text" required value={form.class} onChange={(e) => updateField('class', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" required value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select required value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                The student logs in with their registration number (generated automatically) and a
                password we'll generate — both sent to the parent's contact info below.
              </p>

              <h4 style={{ marginBottom: 'var(--space-3)' }}>Parent / Guardian</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" required value={form.parentInfo.name} onChange={(e) => updateField('parentInfo.name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <select value={form.parentInfo.relationship} onChange={(e) => updateField('parentInfo.relationship', e.target.value)}>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" required value={form.parentInfo.phone} onChange={(e) => updateField('parentInfo.phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input type="email" value={form.parentInfo.email} onChange={(e) => updateField('parentInfo.email', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" required value={form.parentInfo.address} onChange={(e) => updateField('parentInfo.address', e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={form.createParentAccount}
                    onChange={(e) => updateField('createParentAccount', e.target.checked)}
                  />
                  Also create a parent portal account (reuses an existing one for siblings)
                </label>
              </div>

              <h4 style={{ marginBottom: 'var(--space-3)' }}>Emergency Contact</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" required value={form.emergencyContact.name} onChange={(e) => updateField('emergencyContact.name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" required value={form.emergencyContact.phone} onChange={(e) => updateField('emergencyContact.phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <input type="text" required value={form.emergencyContact.relationship} onChange={(e) => updateField('emergencyContact.relationship', e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? <Icon name="loader" size={18} className="spinning" /> : 'Create Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {createdStudent && (
        <div className="modal-backdrop" onClick={() => setCreatedStudent(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Created</h2>
              <button className="modal-close-btn" onClick={() => setCreatedStudent(null)}><Icon name="close" size={22} /></button>
            </div>
            <p style={{ marginBottom: 'var(--space-4)' }}>
              <strong>{createdStudent.fullName}</strong> has been added. Their login registration number is:
            </p>
            <p className="stat-card-value" style={{ marginBottom: 'var(--space-4)' }}>{createdStudent.regNumber}</p>
            <p className="text-secondary text-sm">
              This registration number and a generated password have been sent to the parent's phone/email on file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
