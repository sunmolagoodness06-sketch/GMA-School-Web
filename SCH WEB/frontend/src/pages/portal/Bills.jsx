import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import SVGIcon from '../../components/icons/SVGIcon';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);

// Multiple installments of the same fee schedule/term are separate Invoice
// records under the hood (each independently payable), but showing them as
// unrelated rows is confusing — group them into one row with an installment
// breakdown inside instead.
const groupInvoices = (list) => {
  const groups = new Map();
  for (const inv of list) {
    const scheduleId = inv.feeScheduleId?._id || inv.feeScheduleId || 'none';
    const key = `${scheduleId}-${inv.term}-${inv.session}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inv);
  }
  return Array.from(groups.values()).map((g) => [...g].sort((a, b) => a.installmentNumber - b.installmentNumber));
};

const groupStatus = (group) => {
  if (group.every((inv) => inv.status === 'cancelled')) return 'cancelled';
  if (group.every((inv) => inv.status === 'paid')) return 'paid';
  if (group.some((inv) => inv.status === 'overdue')) return 'overdue';
  if (group.some((inv) => inv.amountPaid > 0)) return 'partial';
  return 'pending';
};

const Bills = () => {
  const { user, apiCall } = useAuth();
  const { selectedChildId } = useSelectedChild();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeInstallmentId, setActiveInstallmentId] = useState(null);
  const [togglingKey, setTogglingKey] = useState(null);
  const requestIdRef = useRef(0);

  const fetchInvoices = async () => {
    if (!selectedChildId) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError('');
    const { data } = await apiCall(`/student/${selectedChildId}/invoices`);
    if (requestId !== requestIdRef.current) return; // a newer request has since superseded this one
    if (data.success) {
      setInvoices(data.data.invoices);
      setSummary(data.data.summary);
    } else {
      setError(data.message || 'Failed to load bills');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  // Handle returning from Paystack's hosted checkout (?reference=... in the URL)
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;

    const verify = async () => {
      const { data } = await apiCall(`/payment/verify/${reference}`);
      setVerifyMessage(data.success ? 'Payment confirmed. Thank you!' : (data.message || 'Payment could not be verified.'));
      setSearchParams({}, { replace: true });
      fetchInvoices();
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleOptionalItem = async (invoice, itemIndex, included) => {
    const key = `${invoice._id}-${itemIndex}`;
    setTogglingKey(key);
    const { data } = await apiCall(`/student/${selectedChildId}/invoices/${invoice._id}/optional-items`, {
      method: 'PATCH',
      body: JSON.stringify({ itemIndex, included })
    });
    if (data.success) {
      await fetchInvoices();
    } else {
      setError(data.message || 'Failed to update the invoice');
    }
    setTogglingKey(null);
  };

  const handlePay = async (invoice) => {
    setPayingId(invoice._id);
    const { data } = await apiCall('/payment/initialize', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: invoice._id,
        amount: invoice.balance,
        callback_url: `${window.location.origin}/portal/bills`
      })
    });

    if (data.success) {
      window.location.href = data.data.authorization_url;
    } else {
      setError(data.message || 'Failed to start payment');
      setPayingId(null);
    }
  };

  if (user?.role === 'student') {
    return (
      <div className="dashboard">
        <div className="card">
          <div className="card-body">
            <p>Bills & Payments isn't available on a student account. A parent can view and pay fees from their own portal login.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <SVGIcon name="loader" size="48" className="spinning" />
        <p>Loading bills...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Bills & Payments</h1>
        </div>
      </div>

      {verifyMessage && (
        <div className="success-message" style={{ marginBottom: 'var(--space-4)' }}>
          <SVGIcon name="checkCircle" size="20" />
          <span>{verifyMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
          <SVGIcon name="alert-circle" size="20" />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><SVGIcon name="credit-card" size="32" /></div>
            <div className="stat-info">
              <h3>Outstanding Balance</h3>
              <div className={`stat-value ${summary.totalOwed > 0 ? 'amount-owed' : 'amount-clear'}`}>
                {formatCurrency(summary.totalOwed)}
              </div>
              {summary.overdueCount > 0 && (
                <p className="stat-note overdue">{summary.overdueCount} overdue</p>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><SVGIcon name="check" size="32" /></div>
            <div className="stat-info">
              <h3>Total Paid</h3>
              <div className="stat-value">{formatCurrency(summary.totalPaid)}</div>
            </div>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>No invoices yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {groupInvoices(invoices).map((group) => {
              const first = group[0];
              const isExpanded = expandedId === first._id;
              const activeInstallment = (isExpanded && group.find((inv) => inv._id === activeInstallmentId)) || group[0];
              const totalDue = group.reduce((s, inv) => s + inv.amountDue, 0);
              const totalBalance = group.reduce((s, inv) => s + inv.balance, 0);
              const status = groupStatus(group);
              return (
                <div key={first._id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-4) var(--space-5)'
                    }}
                  >
                    <button
                      onClick={() => {
                        if (isExpanded) { setExpandedId(null); return; }
                        setExpandedId(first._id);
                        const firstUnpaid = group.find((inv) => inv.status !== 'paid' && inv.status !== 'cancelled');
                        setActiveInstallmentId((firstUnpaid || group[0])._id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', padding: 0 }}
                    >
                      <strong>{first.invoiceNumber}</strong>
                      {group.length > 1 && <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}> ({group.length} installments)</span>}
                      <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                        {first.feeScheduleId?.term} term, {first.feeScheduleId?.session}
                      </div>
                    </button>
                    <div style={{ textAlign: 'right' }}>
                      <div>{formatCurrency(totalBalance)} <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>of {formatCurrency(totalDue)}</span></div>
                      <span className={`stat-note ${status === 'overdue' ? 'overdue' : ''}`} style={{ textTransform: 'capitalize' }}>{status}</span>
                    </div>
                    {group.length === 1 && first.status !== 'paid' && first.status !== 'cancelled' && (
                      <button className="btn btn-primary btn-sm" disabled={payingId === first._id} onClick={() => handlePay(first)}>
                        {payingId === first._id ? <SVGIcon name="loader" size="16" className="spinning" /> : 'Pay Now'}
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 var(--space-5) var(--space-4)' }}>
                      {group.length > 1 && (
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>Installments</strong>
                          <div style={{ marginTop: 'var(--space-2)' }}>
                            {group.map((inv) => (
                              <div
                                key={inv._id}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)',
                                  padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-1)', borderRadius: 'var(--radius-md)',
                                  background: inv._id === activeInstallmentId ? 'var(--color-surface-light)' : 'transparent'
                                }}
                              >
                                <button
                                  onClick={() => setActiveInstallmentId(inv._id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', padding: 0, flex: 1 }}
                                >
                                  Installment {inv.installmentNumber} — due {new Date(inv.dueDate).toLocaleDateString('en-GB')} — {formatCurrency(inv.balance)} of {formatCurrency(inv.amountDue)}
                                  <span className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}> ({inv.status})</span>
                                </button>
                                {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                                  <button className="btn btn-outline btn-sm" disabled={payingId === inv._id} onClick={() => handlePay(inv)}>
                                    {payingId === inv._id ? <SVGIcon name="loader" size="14" className="spinning" /> : 'Pay'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeInstallment.feeItems?.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>
                            {group.length > 1 ? `Installment ${activeInstallment.installmentNumber} — Fee Breakdown` : 'Fee Breakdown'}
                          </strong>
                          <ul style={{ marginTop: 'var(--space-2)', paddingLeft: activeInstallment.status === 'paid' || activeInstallment.status === 'cancelled' ? 'var(--space-5)' : 0, listStyle: activeInstallment.status === 'paid' || activeInstallment.status === 'cancelled' ? undefined : 'none' }}>
                            {activeInstallment.feeItems.map((item, i) => {
                              // "Paid" only means the currently-included items are settled — optional
                              // items can still be opted into afterward, which reopens a balance.
                              const canToggle = item.isOptional && activeInstallment.status !== 'cancelled';
                              const key = `${activeInstallment._id}-${i}`;
                              return (
                                <li key={i} style={{ marginBottom: 'var(--space-1)', opacity: item.isOptional && !item.included ? 0.65 : 1 }}>
                                  {canToggle ? (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={item.included || false}
                                        disabled={togglingKey === key}
                                        onChange={(e) => handleToggleOptionalItem(activeInstallment, i, e.target.checked)}
                                      />
                                      <span>
                                        {item.name}{item.description && ` — ${item.description}`}: {formatCurrency(item.amount)}
                                        <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}> (optional — check to add to amount due)</span>
                                      </span>
                                    </label>
                                  ) : (
                                    <span>
                                      {item.name}{item.description && ` — ${item.description}`}: {formatCurrency(item.amount)}
                                      {item.isOptional && (
                                        <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                                          {item.included ? ' (optional — included)' : ' (optional — not included in amount due)'}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {activeInstallment.discount?.amount > 0 && (
                        <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                          Discount applied: {formatCurrency(activeInstallment.discount.amount)} ({activeInstallment.discount.reason})
                        </p>
                      )}
                      {activeInstallment.paymentHistory?.length > 0 && (
                        <div>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>Payment History</strong>
                          <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-5)' }}>
                            {activeInstallment.paymentHistory.map((p, i) => (
                              <li key={i}>{formatCurrency(p.amount)} via {p.paymentMethod.replace('_', ' ')} on {new Date(p.paymentDate).toLocaleDateString('en-GB')}</li>
                            ))}
                          </ul>
                        </div>
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

export default Bills;
