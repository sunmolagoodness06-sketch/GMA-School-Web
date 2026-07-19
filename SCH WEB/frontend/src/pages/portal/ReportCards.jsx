import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import SVGIcon from '../../components/icons/SVGIcon';
import SchoolCrest from '../../components/SchoolCrest';

const GRADE_COLORS = {
  A: { background: '#D1FAE5', color: '#065F46' },
  B: { background: '#DBEAFE', color: '#1E40AF' },
  C: { background: '#FEF3C7', color: '#92400E' },
  D: { background: '#FED7AA', color: '#9A3412' },
  F: { background: '#FEE2E2', color: '#991B1B' }
};

const GradeBadge = ({ grade }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '50%', fontWeight: 700, fontSize: 'var(--text-sm)',
      ...(GRADE_COLORS[grade] || { background: 'var(--color-surface)', color: 'var(--color-text-secondary)' })
    }}
  >
    {grade}
  </span>
);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const ReportCards = () => {
  const { apiCall } = useAuth();
  const { selectedChildId } = useSelectedChild();
  const [reportCards, setReportCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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
            <p>No report cards available yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {reportCards.map((rc) => {
              const isExpanded = expandedId === rc._id;
              return (
                <div key={rc._id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 'var(--space-4) var(--space-5)'
                    }}
                  >
                    <button
                      onClick={() => rc.type === 'manual' && setExpandedId(isExpanded ? null : rc._id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        background: 'none', border: 'none', cursor: rc.type === 'manual' ? 'pointer' : 'default',
                        textAlign: 'left', font: 'inherit', padding: 0
                      }}
                    >
                      <SVGIcon name="file-text" size="24" />
                      <div>
                        <strong style={{ textTransform: 'capitalize' }}>{rc.term} Term</strong>
                        <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                          {rc.session}{rc.type === 'manual' && rc.summary?.overallGrade ? ` · Overall grade ${rc.summary.overallGrade}` : ''}
                        </div>
                      </div>
                    </button>
                    {rc.type === 'manual' ? (
                      <button className="btn btn-outline btn-sm" onClick={() => setExpandedId(isExpanded ? null : rc._id)}>
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    ) : (
                      <a href={rc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        <SVGIcon name="download" size="16" />
                        Download
                      </a>
                    )}
                  </div>

                  {isExpanded && rc.type === 'manual' && (
                    <div style={{ position: 'relative', padding: '0 var(--space-5) var(--space-6)' }}>
                      <div
                        style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          opacity: 0.06, pointerEvents: 'none', zIndex: 0
                        }}
                      >
                        <SchoolCrest size={420} />
                      </div>
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <SchoolCrest size={44} />
                        <div>
                          <strong>Goodness and Mercy Academy</strong>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>Official Report Card</div>
                        </div>
                      </div>
                      <div style={{ position: 'relative', zIndex: 1, overflowX: 'auto', marginBottom: 'var(--space-5)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Subject</th>
                              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>CA1</th>
                              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>CA2</th>
                              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Exam</th>
                              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Total</th>
                              <th style={{ textAlign: 'center', padding: 'var(--space-2)' }}>Grade</th>
                              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Remark</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rc.subjects?.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                <td style={{ padding: 'var(--space-2)' }}>{s.name}</td>
                                <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>{s.ca1}</td>
                                <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>{s.ca2}</td>
                                <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>{s.exam}</td>
                                <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}><strong>{s.total}</strong></td>
                                <td style={{ textAlign: 'center', padding: 'var(--space-2)' }}><GradeBadge grade={s.grade} /></td>
                                <td style={{ padding: 'var(--space-2)' }}>{s.remark}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
                        <div>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Total Score</div>
                          <strong>{rc.summary?.totalScore}</strong>
                        </div>
                        <div>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Average</div>
                          <strong>{rc.summary?.averageScore}</strong>
                        </div>
                        <div>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Overall Grade</div>
                          <GradeBadge grade={rc.summary?.overallGrade} />
                        </div>
                        {rc.summary?.position && (
                          <div>
                            <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Position</div>
                            <strong>{rc.summary.position}{rc.summary.numberInClass ? ` of ${rc.summary.numberInClass}` : ''}</strong>
                          </div>
                        )}
                        {rc.attendance?.totalDays > 0 && (
                          <div>
                            <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Attendance</div>
                            <strong>{rc.attendance.daysPresent || 0} / {rc.attendance.totalDays} days</strong>
                          </div>
                        )}
                      </div>

                      {rc.classTeacherComment && (
                        <div style={{ position: 'relative', zIndex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Class Teacher's Comment</div>
                          <p>{rc.classTeacherComment}</p>
                        </div>
                      )}
                      {rc.principalComment && (
                        <div style={{ position: 'relative', zIndex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                          <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Principal's Comment</div>
                          <p>{rc.principalComment}</p>
                        </div>
                      )}
                      {rc.nextTermBeginsDate && (
                        <p className="text-secondary" style={{ position: 'relative', zIndex: 1, fontSize: 'var(--text-sm)' }}>
                          Next term begins: <strong>{formatDate(rc.nextTermBeginsDate)}</strong>
                        </p>
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

export default ReportCards;
