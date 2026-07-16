import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import SVGIcon from '../../components/icons/SVGIcon';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);

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
            {invoices.map((inv) => (
              <div
                key={inv._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: '1px solid var(--color-border-light)'
                }}
              >
                <div>
                  <strong>{inv.invoiceNumber}</strong>
                  <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                    {inv.feeScheduleId?.term} term, {inv.feeScheduleId?.session} — due {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{formatCurrency(inv.balance)} <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>of {formatCurrency(inv.amountDue)}</span></div>
                  <span className={`stat-note ${inv.status === 'overdue' ? 'overdue' : ''}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span>
                </div>
                {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                  <button className="btn btn-primary btn-sm" disabled={payingId === inv._id} onClick={() => handlePay(inv)}>
                    {payingId === inv._id ? <SVGIcon name="loader" size="16" className="spinning" /> : 'Pay Now'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
