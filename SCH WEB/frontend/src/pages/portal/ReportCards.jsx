import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import SVGIcon from '../../components/icons/SVGIcon';

const ReportCards = () => {
  const { apiCall } = useAuth();
  const { selectedChildId } = useSelectedChild();
  const [reportCards, setReportCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;

    const fetchReportCards = async () => {
      setIsLoading(true);
      setError('');
      const { data } = await apiCall(`/student/${selectedChildId}/report-cards`);
      if (cancelled) return;
      if (data.success) {
        setReportCards(data.data);
      } else {
        setError(data.message || 'Failed to load report cards');
      }
      setIsLoading(false);
    };

    fetchReportCards();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <SVGIcon name="loader" size="48" className="spinning" />
        <p>Loading report cards...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Report Cards</h1>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <SVGIcon name="alert-circle" size="20" />
          <span>{error}</span>
        </div>
      )}

      {!error && reportCards.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>No report cards have been uploaded yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {reportCards.map((rc) => (
              <div
                key={rc._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: '1px solid var(--color-border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <SVGIcon name="file-text" size="24" />
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>{rc.term} Term</strong>
                    <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>{rc.session}</div>
                  </div>
                </div>
                <a href={rc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <SVGIcon name="download" size="16" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCards;
