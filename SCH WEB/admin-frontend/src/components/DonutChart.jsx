import React from 'react';

const DEFAULT_COLORS = ['#0A1F44', '#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Simple dependency-free donut chart. `data` is [{ label, value, color? }].
const DonutChart = ({ data, size = 150, strokeWidth = 26 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total === 0 ? (
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
          ) : (
            data.filter((d) => d.value > 0).map((d, i) => {
              const fraction = d.value / total;
              const dash = fraction * circumference;
              const el = (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })
          )}
        </g>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700" fill="var(--color-navy)">
          {total}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length], flexShrink: 0 }} />
            <span style={{ textTransform: 'capitalize' }}>{d.label}</span>
            <span className="text-secondary">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
