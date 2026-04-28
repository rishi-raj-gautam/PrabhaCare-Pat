import { useState } from 'react';
import { useApp } from '../context/AppContext';
import RecordCard from '../components/RecordCard';
import RecordDetailModal from '../components/RecordDetailModal';

const FILTER_TYPES = [
  { label: 'All Records', icon: 'grid_view', type: 'all' },
  { label: 'Prescriptions', icon: 'description', type: 'PRESCRIPTION' },
  { label: 'Lab Reports', icon: 'lab_research', type: 'LAB_REPORT' },
  { label: 'Consultations', icon: 'medical_services', type: 'CONSULTATION_NOTE' },
];

export default function HealthRecords() {
  const { records, fetchAPI, profile } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null); // Fix #4: modal state

  const filteredRecords = activeFilter === 'all'
    ? records
    : records.filter(r => r.type === activeFilter);

  const counts = {
    all: records.length,
    PRESCRIPTION: records.filter(r => r.type === 'PRESCRIPTION').length,
    LAB_REPORT: records.filter(r => r.type === 'LAB_REPORT').length,
    CONSULTATION_NOTE: records.filter(r => r.type === 'CONSULTATION_NOTE').length,
  };

  // Group records by month
  const grouped = [];
  let lastMonth = null;
  filteredRecords.forEach(rec => {
    const month = new Date(rec.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (month !== lastMonth) {
      grouped.push({ type: 'month', month });
      lastMonth = month;
    }
    grouped.push({ type: 'record', record: rec });
  });

  return (
    <div className="cp-page">
      {/* Fix #4: Prescription detail modal */}
      {selectedRecord && (
        <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

      {/* Hero */}
      <section className="cp-page-header animate-fade-in-up">
        <div className="cp-page-header-row">
          <div>
            <h1 className="cp-headline">My Health Records</h1>
            <p className="cp-subtitle" style={{ maxWidth: 500 }}>
              Access your medical history, lab results, and prescriptions in one secure sanctuary.
            </p>
          </div>
          <div className="cp-flex cp-gap-3">
            <button className="cp-btn cp-btn--secondary">
              <span className="material-symbols-outlined">share</span>
              Show to Doctor
            </button>
            <button className="cp-btn cp-btn--primary">
              <span className="material-symbols-outlined">upload_file</span>
              Upload Record
            </button>
          </div>
        </div>
      </section>

      <div className="cp-grid cp-grid--12">
        {/* Sidebar: Filters */}
        <aside className="cp-col-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="cp-card cp-card--flat" style={{ borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, color: 'var(--text-h)', marginBottom: 16 }}>Record Types</h3>
            <div className="cp-flex cp-flex-col cp-gap-2">
              {FILTER_TYPES.map(ft => (
                <button
                  key={ft.type}
                  className={`cp-filter-btn ${activeFilter === ft.type ? 'active' : ''}`}
                  onClick={() => setActiveFilter(ft.type)}
                >
                  <span className="cp-filter-btn-left">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{ft.icon}</span>
                    {ft.label}
                  </span>
                  <span className={`cp-filter-count ${activeFilter === ft.type ? 'cp-filter-count--primary' : ''}`}>
                    {counts[ft.type]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* QR Share Card */}
          <div className="cp-share-card" style={{ background: 'linear-gradient(135deg, #003060, #005fb8)', borderRadius: 'var(--radius-xl)' }}>
            <div className="cp-share-overlay" style={{ background: 'linear-gradient(to top, rgba(0,48,96,0.95), rgba(0,95,184,0.4))' }}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Quick Share Access</p>
              <h4 style={{ fontWeight: 800, fontSize: 16 }}>Generate Access Code</h4>
            </div>
          </div>
        </aside>

        {/* Main: Timeline */}
        <div className="cp-col-9">
          <div className="cp-timeline">
            <div className="cp-timeline-line" />

            {grouped.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 16 }}>folder_open</span>
                <p className="cp-muted">No records found.</p>
              </div>
            )}

            {grouped.map((item, i) => {
              if (item.type === 'month') {
                return (
                  <div key={`month-${item.month}`} className="cp-timeline-month animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                    <div className="cp-timeline-marker" style={{ top: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--outline-variant)' }} />
                    </div>
                    {item.month}
                  </div>
                );
              }
              return (
                <div key={item.record._id || item.record.id} className="cp-timeline-item animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                  <div className="cp-timeline-marker">
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>
                      {item.record.type === 'PRESCRIPTION' ? 'description' : item.record.type === 'LAB_REPORT' ? 'lab_research' : 'medical_services'}
                    </span>
                  </div>
                  {/* Fix #4: pass onView to open modal */}
                  <RecordCard record={item.record} onView={setSelectedRecord} />
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button className="cp-btn cp-btn--secondary" style={{ borderRadius: 'var(--radius-full)' }}>
                Load Older Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
