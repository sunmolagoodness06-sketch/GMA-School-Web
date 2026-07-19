import React from 'react';

// Simple dependency-free vertical bar chart. `data` is [{ label, value, color? }].
const BarChart = ({ data, height = 180, formatValue = (v) => v }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.every((d) => d.value === 0)) {
    return <div className="text-secondary text-sm" style={{ padding: 'var(--space-6) 0', textAlign: 'center' }}>No data yet.</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height, padding: 'var(--space-2) 0' }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
          <span className="text-secondary text-sm" style={{ marginBottom: 'var(--space-1)', whiteSpace: 'nowrap' }}>{formatValue(d.value)}</span>
          <div
            style={{
              width: '100%',
              maxWidth: 56,
              height: `${(d.value / max) * 100}%`,
              minHeight: d.value > 0 ? 4 : 0,
              background: d.color || 'var(--color-navy)',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              transition: 'height 0.3s ease'
            }}
          />
          <span className="text-secondary text-sm" style={{ marginTop: 'var(--space-2)', textAlign: 'center', textTransform: 'capitalize' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
