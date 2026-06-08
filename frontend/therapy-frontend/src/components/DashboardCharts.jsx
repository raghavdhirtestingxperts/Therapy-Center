// Dashboard charts using inline SVG (no external dependency needed)
// Renders simple visual charts from appointment/payment data

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#8b5cf6', '#ef4444'];

// Simple donut chart
function DonutChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-muted small text-center py-4">No data</div>;

  let cumulative = 0;
  const size = 140;
  const radius = 55;
  const strokeWidth = 20;

  return (
    <div className="text-center">
      <h6 className="fw-bold small mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h6>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.value / total;
          const circumference = 2 * Math.PI * radius;
          const dashLength = pct * circumference;
          const dashOffset = -(cumulative / total) * circumference;
          cumulative += d.value;
          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
        <text x="50%" y="50%" textAnchor="middle" dy="0.3em" className="fw-bold" style={{ fontSize: '1.2rem', fill: 'var(--text-primary)' }}>
          {total}
        </text>
      </svg>
      <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
        {data.map((d, i) => (
          <div key={i} className="d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
            <span className="text-muted">{d.label}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple bar chart
function BarChart({ data, title, prefix = '' }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div>
      <h6 className="fw-bold small mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h6>
      <div className="d-flex align-items-end gap-2" style={{ height: 120 }}>
        {data.map((d, i) => (
          <div key={i} className="d-flex flex-column align-items-center flex-fill">
            <div className="small fw-bold mb-1" style={{ fontSize: '0.7rem', color: COLORS[i % COLORS.length] }}>
              {prefix}{d.value}
            </div>
            <div
              style={{
                width: '100%', maxWidth: 40,
                height: `${(d.value / max) * 80}px`,
                background: `linear-gradient(to top, ${COLORS[i % COLORS.length]}88, ${COLORS[i % COLORS.length]})`,
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.5s ease',
                minHeight: 4
              }}
            />
            <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main dashboard charts component
const DashboardCharts = ({ appointments = [], payments = [], therapies = [] }) => {
  // Status breakdown
  const statusData = [
    { label: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length },
    { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length },
  ];

  // Revenue by therapy
  const revenueByTherapy = {};
  payments.filter(p => p.status === 'Paid').forEach(p => {
    const name = p.appointment?.therapy?.name || 'Other';
    revenueByTherapy[name] = (revenueByTherapy[name] || 0) + p.amount;
  });
  const revenueData = Object.entries(revenueByTherapy).map(([label, value]) => ({ label, value }));

  // Appointments by therapy
  const apptByTherapy = {};
  appointments.forEach(a => {
    const name = a.therapy?.name || 'Other';
    apptByTherapy[name] = (apptByTherapy[name] || 0) + 1;
  });
  const apptData = Object.entries(apptByTherapy).map(([label, value]) => ({ label, value }));

  return (
    <div className="row g-4 mt-2">
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4 d-flex align-items-center justify-content-center">
            <DonutChart data={statusData} title="Appointment Status" />
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <BarChart data={revenueData.slice(0, 6)} title="Revenue by Therapy" prefix="₹" />
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <BarChart data={apptData.slice(0, 6)} title="Sessions by Therapy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
