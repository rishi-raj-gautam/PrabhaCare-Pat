import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// ── Vital field definitions ──────────────────────────────────────────────────
const VITAL_FIELDS = [
  {
    key: 'bpSys',
    label: 'Systolic BP',
    unit: 'mmHg',
    icon: 'favorite',
    placeholder: '120',
    iconVariant: 'bp',
    min: 60, max: 250,
    pair: 'bpDia',
  },
  {
    key: 'bpDia',
    label: 'Diastolic BP',
    unit: 'mmHg',
    icon: 'favorite_border',
    placeholder: '80',
    iconVariant: 'bp',
    min: 40, max: 150,
  },
  {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    icon: 'cardiology',
    placeholder: '72',
    iconVariant: 'heart',
    min: 30, max: 250,
  },
  {
    key: 'spo2',
    label: 'SpO₂',
    unit: '%',
    icon: 'air',
    placeholder: '98',
    iconVariant: 'spo2',
    min: 70, max: 100,
  },
  {
    key: 'glucoseFasting',
    label: 'Glucose (Fasting)',
    unit: 'mg/dL',
    icon: 'water_drop',
    placeholder: '90',
    iconVariant: 'temp',
    min: 40, max: 600,
  },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    icon: 'thermostat',
    placeholder: '37.0',
    iconVariant: 'temp',
    min: 34, max: 42,
    step: '0.1',
  },
  {
    key: 'respiratoryRate',
    label: 'Respiratory Rate',
    unit: 'br/min',
    icon: 'pulmonology',
    placeholder: '16',
    iconVariant: 'spo2',
    min: 6, max: 60,
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────
function getStatus(key, val) {
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  switch (key) {
    case 'bpSys': return v >= 140 ? 'High' : v < 90 ? 'Low' : 'Normal';
    case 'bpDia': return v >= 90 ? 'High' : v < 60 ? 'Low' : 'Normal';
    case 'heartRate': return v > 100 ? 'High' : v < 60 ? 'Low' : 'Normal';
    case 'spo2': return v < 95 ? 'Low' : 'Normal';
    case 'glucoseFasting': return v > 126 ? 'High' : v < 70 ? 'Low' : 'Normal';
    case 'temperature': return v > 37.5 ? 'Fever' : v < 36 ? 'Low' : 'Normal';
    case 'respiratoryRate': return v > 20 ? 'High' : v < 12 ? 'Low' : 'Normal';
    default: return 'Normal';
  }
}

const STATUS_COLOR = {
  Normal: 'var(--tertiary)',
  High: 'var(--error)',
  Low: 'var(--error)',
  Fever: 'var(--error)',
};

// ── History table row ─────────────────────────────────────────────────────────
function HistoryRow({ vital, index }) {
  const m = vital.metrics || {};
  const date = new Date(vital.recordedAt);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const entries = VITAL_FIELDS
    .filter(f => m[f.key] !== undefined && m[f.key] !== null && m[f.key] !== '')
    .map(f => ({ label: f.label, unit: f.unit, value: m[f.key], status: getStatus(f.key, m[f.key]) }));

  if (entries.length === 0) return null;

  return (
    <div className="cp-card" style={{ marginBottom: 16, padding: '20px 24px' }}>
      <div className="cp-flex cp-justify-between cp-items-center cp-mb-4">
        <div className="cp-flex cp-items-center cp-gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>monitoring</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>{dateStr} · {timeStr}</p>
            <p className="cp-muted cp-small">{entries.length} metric{entries.length > 1 ? 's' : ''} recorded</p>
          </div>
        </div>
        <span className="cp-tag cp-tag--primary">Entry #{index + 1}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {entries.map(e => (
          <div key={e.label} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '10px 14px' }}>
            <p className="cp-muted cp-small" style={{ marginBottom: 2 }}>{e.label}</p>
            <p style={{ fontWeight: 800, color: 'var(--text-h)', fontSize: 16 }}>
              {e.value} <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--muted)' }}>{e.unit}</span>
            </p>
            {e.status && (
              <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[e.status] || 'var(--tertiary)' }}>
                {e.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Vitals() {
  const { vitals, addVital, isLoading, profile } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'add' | 'history'
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const latestVital = vitals[0] || null;

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Only include fields that have actual values
    const metrics = {};
    VITAL_FIELDS.forEach(f => {
      const v = form[f.key];
      if (v !== undefined && v !== '') metrics[f.key] = parseFloat(v);
    });

    if (Object.keys(metrics).length === 0) {
      setError('Please fill in at least one vital metric.');
      return;
    }

    setSaving(true);
    const result = await addVital(metrics);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setForm({});
      setTimeout(() => { setSaved(false); setActiveTab('current'); }, 1500);
    } else {
      setError(result.error || 'Failed to save vitals. Please try again.');
    }
  };

  return (
    <div className="cp-page">
      {/* Header */}
      <section className="cp-page-header animate-fade-in-up">
        <div className="cp-page-header-row">
          <div>
            <h1 className="cp-headline">My Vitals</h1>
            <p className="cp-subtitle">Track and monitor your health metrics over time.</p>
          </div>
          <button className="cp-btn cp-btn--primary" onClick={() => setActiveTab('add')}>
            <span className="material-symbols-outlined">add</span>
            Log New Vitals
          </button>
        </div>
      </section>

      {/* Tab Pills */}
      <div className="cp-flex cp-gap-2 cp-mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        {[
          { key: 'current', label: 'Current', icon: 'monitor_heart' },
          { key: 'add', label: 'Log Vitals', icon: 'add_circle' },
          { key: 'history', label: 'History', icon: 'history' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(''); }}
            className="cp-btn"
            style={{
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-container)',
              color: activeTab === tab.key ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              gap: 8, padding: '10px 20px', fontSize: 14,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
            {tab.key === 'history' && vitals.length > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '0 8px', fontSize: 12 }}>
                {vitals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: CURRENT ───────────────────────────────────────── */}
      {activeTab === 'current' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {latestVital ? (() => {
            const m = latestVital.metrics || {};
            const date = new Date(latestVital.recordedAt);
            const items = VITAL_FIELDS.filter(f => m[f.key] !== undefined && m[f.key] !== '');
            return (
              <>
                {/* Summary Banner */}
                <div className="cp-card" style={{ background: 'linear-gradient(135deg, var(--primary), #0055a4)', color: '#fff', marginBottom: 24 }}>
                  <div className="cp-flex cp-justify-between cp-items-center">
                    <div>
                      <p style={{ opacity: 0.75, fontSize: 13, marginBottom: 4 }}>Last recorded on</p>
                      <p style={{ fontWeight: 800, fontSize: 18 }}>
                        {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>monitor_heart</span>
                    </div>
                  </div>
                </div>

                {/* Metric Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {items.map(f => {
                    const val = m[f.key];
                    const status = getStatus(f.key, val);
                    return (
                      <div key={f.key} className="cp-card" style={{ padding: '20px 22px' }}>
                        <div className="cp-flex cp-items-center cp-gap-3 cp-mb-4">
                          <div className={`cp-vital-icon cp-vital-icon--${f.iconVariant}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                          </div>
                          <p className="cp-muted cp-small" style={{ fontWeight: 600 }}>{f.label}</p>
                        </div>
                        <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-h)', letterSpacing: '-0.5px' }}>
                          {val}
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginLeft: 4 }}>{f.unit}</span>
                        </p>
                        {status && (
                          <div style={{ marginTop: 8 }}>
                            <span className={`cp-tag cp-tag--${status === 'Normal' ? 'success' : 'error'}`}>{status}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="cp-btn cp-btn--secondary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                  onClick={() => setActiveTab('history')}
                >
                  <span className="material-symbols-outlined">history</span>
                  View Full History ({vitals.length} entries)
                </button>
              </>
            );
          })() : (
            <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 64 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--outline-variant)', display: 'block', marginBottom: 16 }}>monitor_heart</span>
              <h3 className="cp-section-title" style={{ marginBottom: 8 }}>No Vitals Recorded Yet</h3>
              <p className="cp-muted" style={{ marginBottom: 24 }}>Start tracking your health metrics by logging your first reading.</p>
              <button className="cp-btn cp-btn--primary" onClick={() => setActiveTab('add')}>
                <span className="material-symbols-outlined">add</span>
                Log First Reading
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ADD VITALS ────────────────────────────────────── */}
      {activeTab === 'add' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="cp-card" style={{ maxWidth: 720, borderRadius: 'var(--radius-3xl)' }}>
            <h2 className="cp-section-title cp-mb-2">Log New Reading</h2>
            <p className="cp-muted cp-mb-8">Fill in the metrics you have measured. You don't need all of them — even one is useful.</p>

            {error && (
              <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6, fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            {saved && (
              <div style={{ background: 'var(--tertiary-fixed)', color: 'var(--tertiary)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6, fontSize: 18 }}>check_circle</span>
                Vitals saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="cp-form">
              {/* BP as a special paired row */}
              <div>
                <p className="cp-label cp-mb-2" style={{ fontSize: 12, letterSpacing: '0.04em' }}>BLOOD PRESSURE</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {['bpSys', 'bpDia'].map(key => {
                    const f = VITAL_FIELDS.find(x => x.key === key);
                    const status = getStatus(key, form[key]);
                    return (
                      <div key={key} className="cp-form-group">
                        <label className="cp-label">{f.label} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({f.unit})</span></label>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="cp-input"
                            type="number"
                            placeholder={f.placeholder}
                            min={f.min}
                            max={f.max}
                            value={form[key] || ''}
                            onChange={e => handleChange(key, e.target.value)}
                            style={{ paddingRight: status ? 80 : 16 }}
                          />
                          {status && (
                            <span style={{
                              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                              fontSize: 11, fontWeight: 700, color: STATUS_COLOR[status] || 'var(--tertiary)'
                            }}>{status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remaining fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                {VITAL_FIELDS.filter(f => f.key !== 'bpSys' && f.key !== 'bpDia').map(f => {
                  const status = getStatus(f.key, form[f.key]);
                  return (
                    <div key={f.key} className="cp-form-group">
                      <label className="cp-label">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4, color: 'var(--primary)' }}>{f.icon}</span>
                        {f.label} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({f.unit})</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="cp-input"
                          type="number"
                          placeholder={f.placeholder}
                          min={f.min}
                          max={f.max}
                          step={f.step || '1'}
                          value={form[f.key] || ''}
                          onChange={e => handleChange(f.key, e.target.value)}
                          style={{ paddingRight: status ? 80 : 16 }}
                        />
                        {status && (
                          <span style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 11, fontWeight: 700, color: STATUS_COLOR[status] || 'var(--tertiary)'
                          }}>{status}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cp-flex cp-gap-3" style={{ marginTop: 12 }}>
                <button
                  type="submit"
                  className="cp-btn cp-btn--primary"
                  disabled={saving || isLoading}
                  style={{ minWidth: 160 }}
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      Save Vitals
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn--ghost"
                  onClick={() => { setForm({}); setError(''); }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: HISTORY ──────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {vitals.length === 0 ? (
            <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 64 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', display: 'block', marginBottom: 12 }}>history</span>
              <p className="cp-muted">No vitals history yet. Log your first reading to get started.</p>
            </div>
          ) : (
            <>
              <p className="cp-muted cp-mb-8">Showing all {vitals.length} recorded entries, newest first.</p>
              {vitals.map((v, i) => <HistoryRow key={v._id || i} vital={v} index={i} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
