import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const DIVISIONS = ['nursery', 'primary', 'secondary', 'college'];
const TERMS = ['first', 'second', 'third'];
const FEE_CATEGORIES = ['tuition', 'registration', 'uniform', 'books', 'transport', 'feeding', 'development', 'other'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

const emptyScheduleForm = {
  division: '', class: '', term: 'first', session: '2024/2025',
  dueDate: '', feeItems: [{ name: '', amount: '', category: 'tuition' }]
};

const Billing = () => {
  const { apiCall } = useAuth();
  const [tab, setTab] = useState('invoices');

  // Invoices
  const [invoices, setInvoices] = useState([]);
  const [invoicePagination, setInvoicePagination] = useState({ current: 1, total: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash', notes: '' });
  const [paymentError, setPaymentError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Fee Schedules
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [scheduleError, setScheduleError] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);

  const fetchInvoices = async (page = 1) => {
    setInvoicesLoading(true);
    const query = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
    const { data } = await apiCall(`/admin/invoices?${query}`);
    if (data.success) {
      setInvoices(data.data.invoices);
      setInvoicePagination(data.data.pagination);
    }
    setInvoicesLoading(false);
  };

  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    const { data } = await apiCall('/admin/fee-schedules?limit=50');
    if (data.success) setSchedules(data.data.feeSchedules);
    setSchedulesLoading(false);
  };

  useEffect(() => {
    fetchInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (tab === 'schedules') fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setIsPaying(true);

    const { data } = await apiCall(`/admin/invoices/${selectedInvoice._id}/payments`, {
      method: 'POST',
      body: JSON.stringify({ ...paymentForm, amount: parseFloat(paymentForm.amount) })
    });

    if (data.success) {
      setSelectedInvoice(null);
      setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
      fetchInvoices(invoicePagination.current);
    } else {
      setPaymentError(data.message || data.errors?.[0]?.msg || 'Failed to record payment');
    }
    setIsPaying(false);
  };

  const updateFeeItem = (index, field, value) => {
    setScheduleForm((prev) => {
      const feeItems = [...prev.feeItems];
      feeItems[index] = { ...feeItems[index], [field]: value };
      return { ...prev, feeItems };
    });
  };

  const addFeeItem = () => {
    setScheduleForm((prev) => ({ ...prev, feeItems: [...prev.feeItems, { name: '', amount: '', category: 'other' }] }));
  };

  const removeFeeItem = (index) => {
    setScheduleForm((prev) => ({ ...prev, feeItems: prev.feeItems.filter((_, i) => i !== index) }));
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setIsSubmittingSchedule(true);

    const payload = {
      ...scheduleForm,
      feeItems: scheduleForm.feeItems.map((item) => ({ ...item, amount: parseFloat(item.amount) }))
    };

    const { data } = await apiCall('/admin/fee-schedules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.success) {
      setShowScheduleForm(false);
      setScheduleForm(emptyScheduleForm);
      fetchSchedules();
    } else {
      setScheduleError(data.message || data.errors?.[0]?.msg || 'Failed to create fee schedule');
    }
    setIsSubmittingSchedule(false);
  };

  const handleGenerateInvoices = async (scheduleId) => {
    setGeneratingFor(scheduleId);
    const { data } = await apiCall(`/admin/fee-schedules/${scheduleId}/generate-invoices`, { method: 'POST' });
    setGeneratingFor(null);
    if (data.success) {
      alert(data.message);
      if (tab === 'invoices') fetchInvoices(1);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p className="text-secondary">Fee schedules, invoices, and payments</p>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`btn btn-sm ${tab === 'invoices' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('invoices')}>Invoices</button>
        <button className={`btn btn-sm ${tab === 'schedules' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('schedules')}>Fee Schedules</button>
      </div>

      {tab === 'invoices' && (
        <>
          <div className="filter-bar">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {invoicesLoading ? (
            <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
          ) : invoices.length === 0 ? (
            <div className="empty-state">No invoices found.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Student</th>
                    <th>Amount Due</th>
                    <th>Balance</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.studentId?.fullName}<br /><span className="text-secondary text-sm">{inv.studentId?.regNumber}</span></td>
                      <td>{formatCurrency(inv.amountDue)}</td>
                      <td>{formatCurrency(inv.balance)}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                      <td><span className={`badge badge-${inv.status === 'paid' ? 'approved' : inv.status === 'overdue' ? 'rejected' : 'pending'}`}>{inv.status}</span></td>
                      <td>
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button className="btn btn-outline btn-sm" onClick={() => setSelectedInvoice(inv)}>Record Payment</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {invoicePagination.total > 1 && (
            <div className="pagination-bar">
              <button className="btn btn-outline btn-sm" disabled={invoicePagination.current <= 1} onClick={() => fetchInvoices(invoicePagination.current - 1)}>Previous</button>
              <span className="text-sm">Page {invoicePagination.current} of {invoicePagination.total}</span>
              <button className="btn btn-outline btn-sm" disabled={invoicePagination.current >= invoicePagination.total} onClick={() => fetchInvoices(invoicePagination.current + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {tab === 'schedules' && (
        <>
          <div className="page-header">
            <div />
            <button className="btn btn-primary" onClick={() => setShowScheduleForm(true)}>
              <Icon name="plus" size={16} /> New Fee Schedule
            </button>
          </div>

          {schedulesLoading ? (
            <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>
          ) : schedules.length === 0 ? (
            <div className="empty-state">No fee schedules yet.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Division / Class</th>
                    <th>Term</th>
                    <th>Session</th>
                    <th>Total</th>
                    <th>Due Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s._id}>
                      <td>{s.division} / {s.class}</td>
                      <td style={{ textTransform: 'capitalize' }}>{s.term}</td>
                      <td>{s.session}</td>
                      <td>{formatCurrency(s.totalAmount)}</td>
                      <td>{new Date(s.dueDate).toLocaleDateString('en-GB')}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={generatingFor === s._id}
                          onClick={() => handleGenerateInvoices(s._id)}
                        >
                          {generatingFor === s._id ? <Icon name="loader" size={14} className="spinning" /> : 'Generate Invoices'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Payment — {selectedInvoice.invoiceNumber}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedInvoice(null)}><Icon name="close" size={22} /></button>
            </div>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              Balance owed: <strong>{formatCurrency(selectedInvoice.balance)}</strong>
            </p>
            <form onSubmit={handleRecordPayment}>
              {paymentError && (
                <div className="admin-error-message">
                  <Icon name="alertCircle" size={18} />
                  <span>{paymentError}</span>
                </div>
              )}
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number" min="0.01" step="0.01" required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card (in person)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input type="text" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isPaying}>
                {isPaying ? <Icon name="loader" size={18} className="spinning" /> : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Fee Schedule Modal */}
      {showScheduleForm && (
        <div className="modal-backdrop" onClick={() => setShowScheduleForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Fee Schedule</h2>
              <button className="modal-close-btn" onClick={() => setShowScheduleForm(false)}><Icon name="close" size={22} /></button>
            </div>
            <form onSubmit={handleCreateSchedule}>
              {scheduleError && (
                <div className="admin-error-message">
                  <Icon name="alertCircle" size={18} />
                  <span>{scheduleError}</span>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Division</label>
                  <select required value={scheduleForm.division} onChange={(e) => setScheduleForm({ ...scheduleForm, division: e.target.value })}>
                    <option value="">Select division</option>
                    {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <input type="text" required value={scheduleForm.class} onChange={(e) => setScheduleForm({ ...scheduleForm, class: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Term</label>
                  <select value={scheduleForm.term} onChange={(e) => setScheduleForm({ ...scheduleForm, term: e.target.value })}>
                    {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Session</label>
                  <input type="text" required value={scheduleForm.session} onChange={(e) => setScheduleForm({ ...scheduleForm, session: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" required value={scheduleForm.dueDate} onChange={(e) => setScheduleForm({ ...scheduleForm, dueDate: e.target.value })} />
              </div>

              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>Fee Items</label>
              {scheduleForm.feeItems.map((item, i) => (
                <div key={i} className="form-row" style={{ alignItems: 'end', marginBottom: 'var(--space-2)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input type="text" placeholder="Name (e.g. Tuition)" required value={item.name} onChange={(e) => updateFeeItem(i, 'name', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: 'var(--space-2)' }}>
                    <input type="number" placeholder="Amount" min="0" required value={item.amount} onChange={(e) => updateFeeItem(i, 'amount', e.target.value)} />
                    <select value={item.category} onChange={(e) => updateFeeItem(i, 'category', e.target.value)}>
                      {FEE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {scheduleForm.feeItems.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFeeItem(i)}><Icon name="x" size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addFeeItem} style={{ marginBottom: 'var(--space-4)' }}>
                <Icon name="plus" size={14} /> Add Fee Item
              </button>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmittingSchedule}>
                {isSubmittingSchedule ? <Icon name="loader" size={18} className="spinning" /> : 'Create Fee Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
