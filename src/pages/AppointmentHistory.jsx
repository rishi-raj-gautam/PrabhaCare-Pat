import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', tagClass: 'cp-tag--success', icon: 'check_circle' },
  CANCELLED: { label: 'Cancelled', tagClass: 'cp-tag--neutral', icon: 'cancel' },
  NO_SHOW: { label: 'No-Show', tagClass: 'cp-tag--neutral', icon: 'person_off' },
};

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { appointments, records } = useApp();

  const now = new Date();
  const pastAppts = appointments
    .filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW' || new Date(a.startTime) < now)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // Get related prescription for a completed appointment
  const getPrescription = (appt) => {
    const patId = appt.patientId?._id || appt.patientId;
    return records.find(r =>
      r.type === 'PRESCRIPTION' &&
      (r.patientId?._id || r.patientId) === patId &&
      Math.abs(new Date(r.createdAt) - new Date(appt.startTime)) < 7 * 24 * 60 * 60 * 1000
    );
  };

  return (
    <div className="cp-page">
      {/* Header */}
      <section className="cp-page-header animate-fade-in-up">
        <div className="cp-page-header-row">
          <div>
            <h1 className="cp-headline">Appointment History</h1>
            <p className="cp-subtitle">
              Review your past consultations, prescriptions, and health visits.
            </p>
          </div>
          <button className="cp-btn cp-btn--secondary" onClick={() => navigate('/doctors')}>
            <span className="material-symbols-outlined">calendar_add_on</span>
            Book New
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="cp-grid cp-grid--3 animate-fade-in-up cp-mb-8" style={{ animationDelay: '0.1s', gap: 16 }}>
        {[
          { label: 'Total Visits', value: pastAppts.length, icon: 'event_note', variant: 'primary' },
          { label: 'Completed', value: pastAppts.filter(a => a.status === 'COMPLETED').length, icon: 'check_circle', variant: 'success' },
          { label: 'Cancelled', value: pastAppts.filter(a => a.status === 'CANCELLED').length, icon: 'cancel', variant: 'neutral' },
        ].map(stat => (
          <div key={stat.label} className="cp-card cp-card--flat" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-xl)', flexShrink: 0,
              background: 'var(--secondary-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>{stat.icon}</span>
            </div>
            <div>
              <p className="cp-muted cp-small">{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-h)', lineHeight: 1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History List */}
      {pastAppts.length === 0 ? (
        <div className="cp-card" style={{ textAlign: 'center', padding: 64 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 16 }}>history</span>
          <h3 style={{ fontWeight: 800, color: 'var(--text-h)', marginBottom: 8 }}>No Past Appointments</h3>
          <p className="cp-muted">Once you've completed consultations, they'll appear here.</p>
          <button className="cp-btn cp-btn--primary cp-mt-8" onClick={() => navigate('/doctors')}>Find a Doctor</button>
        </div>
      ) : (
        <div className="cp-flex cp-flex-col cp-gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {pastAppts.map((appt, i) => {
            const doc = appt.doctorId || {};
            const start = new Date(appt.startTime);
            const dateStr = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const config = STATUS_CONFIG[appt.status] || STATUS_CONFIG.COMPLETED;
            const isVideo = appt.type === 'VIDEO';
            const prescription = getPrescription(appt);

            return (
              <div
                key={appt._id || i}
                className="cp-card animate-fade-in-up"
                style={{ animationDelay: `${0.1 + i * 0.04}s`, padding: '24px 28px' }}
              >
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div className="cp-avatar cp-avatar--lg" style={{ borderRadius: 'var(--radius-xl)', flexShrink: 0 }}>
                    <img src={doc.avatarUrl || 'https://via.placeholder.com/150'} alt={doc.name} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 800, color: 'var(--text-h)', fontSize: 16 }}>{doc.name || 'Doctor'}</h3>
                      <span className={`cp-tag ${config.tagClass}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{config.icon}</span>
                        {config.label}
                      </span>
                      <span className={`cp-tag ${isVideo ? 'cp-tag--primary' : 'cp-tag--neutral'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{isVideo ? 'video_camera_front' : 'person'}</span>
                        {isVideo ? 'Video' : 'In-Person'}
                      </span>
                    </div>
                    <p className="cp-muted cp-small" style={{ marginBottom: 4 }}>{doc.specialty} • {doc.hospital || 'CareOS Hospital'}</p>
                    <p className="cp-muted cp-small">
                      <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>schedule</span>
                      {dateStr} at {timeStr}
                    </p>
                    {appt.notes && (
                      <p className="cp-muted cp-small" style={{ marginTop: 4, fontStyle: 'italic' }}>"{appt.notes}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    {appt.status === 'BOOKED' && isVideo && (
                      <button className="cp-btn cp-btn--primary cp-btn--sm" onClick={() => navigate(`/consultation/${appt._id}`)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>videocam</span>
                        Join Call
                      </button>
                    )}
                    {prescription ? (
                      <button className="cp-btn cp-btn--primary cp-btn--sm" onClick={() => navigate('/records')}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
                        View Rx
                      </button>
                    ) : appt.status === 'COMPLETED' ? (
                      <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate('/records')}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>
                        Records
                      </button>
                    ) : null}
                    <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate(`/booking/${doc._id || ''}`)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                      Rebook
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
