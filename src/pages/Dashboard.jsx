import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { profile, appointments, records, notifications, vitalsDisplay, refreshAppointments } = useApp();
  const navigate = useNavigate();
  const firstName = profile.name?.split(' ')[0] || 'there';

  useEffect(() => {
    refreshAppointments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  const upcomingAppts = appointments.filter(a => a.status === 'BOOKED' && new Date(a.startTime) >= now);
  const pastAppts = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const renderAppointmentCard = (appt, i) => {
    // Fix #5: appt.doctorId is likely just the ID string, find the actual doctor object in the doctors list
    const { doctors } = useApp();
    const docIdStr = typeof appt.doctorId === 'object' ? appt.doctorId?._id : appt.doctorId;
    const doc = doctors?.find(d => d._id === docIdStr) || appt.doctorId || {};
    
    const start = new Date(appt.startTime);
    const dateStr = start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isVideo = appt.type === 'VIDEO';
    const isNext = i === 0;

    return (
      <div key={appt._id || appt.id} className="cp-appt-card" style={{ opacity: isNext ? 1 : 0.75 }}>
        <div className="cp-appt-left">
          <div className="cp-avatar cp-avatar--lg" style={{ borderRadius: 'var(--radius-xl)' }}>
            <img src={doc.avatarUrl || 'https://via.placeholder.com/150'} alt={doc.name} />
          </div>
          <div className="cp-appt-info">
            <h3>{doc.name || 'Doctor'}</h3>
            <p>{doc.specialty || 'General'} • {doc.hospital || 'CareOS Hospital'}</p>
            <div className="cp-appt-tags">
              <span className="cp-pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {isVideo ? 'video_camera_front' : 'person'}
                </span>
                {isVideo ? 'Video Call' : 'In-Person'}
              </span>
              <span className="cp-pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                {dateStr}
              </span>
              <span className="cp-pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                {timeStr}
              </span>
            </div>
          </div>
        </div>
        {/* Fix #2: Show Join button only for VIDEO type appointments */}
        {isVideo ? (
          <button className="cp-btn cp-btn--primary" onClick={() => navigate(`/consultation/${appt._id || appt.id}`)}>
            <span className="material-symbols-outlined">videocam</span>
            Join Call
          </button>
        ) : (
          <button className="cp-btn cp-btn--ghost" onClick={() => navigate('/queue')}>
            <span className="material-symbols-outlined">place</span>
            View Queue
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="cp-page">
      {/* Hero */}
      <section className="cp-mb-8 animate-fade-in-up">
        <h1 className="cp-headline">Namaste, {firstName}.</h1>
        <p className="cp-subtitle" style={{ fontSize: 17, maxWidth: 500 }}>
          Your health journey is looking stable. You have {upcomingAppts.length} upcoming appointment{upcomingAppts.length !== 1 ? 's' : ''}.
        </p>
      </section>

      <div className="cp-grid cp-grid--12">
        {/* Left Column */}
        <div className="cp-col-8" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Quick Actions */}
          <div className="cp-bento animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button className="cp-bento-item cp-bento--book" onClick={() => navigate('/doctors')}>
              <span className="material-symbols-outlined">calendar_add_on</span>
              <span>Book Appointment</span>
            </button>
            <button className="cp-bento-item cp-bento--consult" onClick={() => navigate('/history')}>
              <span className="material-symbols-outlined">video_chat</span>
              <span>My Consultations</span>
            </button>
            <button className="cp-bento-item cp-bento--upload" onClick={() => navigate('/records')}>
              <span className="material-symbols-outlined">upload_file</span>
              <span>Upload Report</span>
            </button>
          </div>

          {/* Upcoming Appointments */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="cp-section-header">
              <h2 className="cp-section-title">Upcoming Appointments</h2>
              <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate('/booking')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Book New
              </button>
            </div>
            <div className="cp-flex cp-flex-col cp-gap-4">
              {upcomingAppts.length > 0 ? (
                upcomingAppts.slice(0, 3).map((appt, i) => renderAppointmentCard(appt, i))
              ) : (
                <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 32 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 12 }}>event_available</span>
                  <p className="cp-muted" style={{ marginBottom: 16 }}>No upcoming appointments.</p>
                  <button className="cp-btn cp-btn--secondary cp-btn--sm" onClick={() => navigate('/doctors')}>Book one now</button>
                </div>
              )}
            </div>
          </section>

          {/* Fix #3: Appointment History Section */}
          {pastAppts.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="cp-section-header">
                <h2 className="cp-section-title">Recent History</h2>
                <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate('/history')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
                  View All
                </button>
              </div>
              <div className="cp-flex cp-flex-col cp-gap-3">
                {pastAppts.slice(0, 2).map(appt => {
                  const doc = appt.doctorId || {};
                  const d = new Date(appt.startTime);
                  const isCompleted = appt.status === 'COMPLETED';
                  return (
                    <div key={appt._id} className="cp-card cp-card--flat" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
                      <div className="cp-avatar cp-avatar--md" style={{ borderRadius: 'var(--radius-xl)' }}>
                        <img src={doc.avatarUrl || 'https://via.placeholder.com/150'} alt={doc.name} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>{doc.name || 'Doctor'}</p>
                        <p className="cp-muted cp-small">{doc.specialty} • {d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span className={`cp-tag ${isCompleted ? 'cp-tag--success' : 'cp-tag--neutral'}`}>
                        {isCompleted ? 'Completed' : 'Cancelled'}
                      </span>
                      <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate('/records')}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
                        Rx
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent Records */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="cp-section-header">
              <h2 className="cp-section-title">Recent Records</h2>
              <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => navigate('/records')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Upload New
              </button>
            </div>
            <div className="cp-grid cp-grid--2">
              {records.slice(0, 2).map(rec => (
                <div key={rec._id || rec.id} className="cp-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/records')}>
                  <div className="cp-flex cp-justify-between cp-items-start cp-mb-4">
                    <div style={{
                      padding: 12, borderRadius: 'var(--radius-xl)',
                      background: 'var(--secondary-container)', color: 'var(--on-surface-variant)',
                    }}>
                      <span className="material-symbols-outlined">{rec.type === 'PRESCRIPTION' ? 'description' : 'lab_research'}</span>
                    </div>
                    <span className="cp-muted cp-small">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontWeight: 800, marginBottom: 4, color: 'var(--text-h)' }}>{rec.title}</h4>
                  <p className="cp-muted cp-small cp-mb-4">{rec.doctorId?.name || 'CareOS Provider'}</p>
                  <div className="cp-flex cp-justify-between cp-items-center">
                    <span className="cp-tag cp-tag--lg cp-tag--primary">{rec.type}</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>chevron_right</span>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 24, gridColumn: 'span 2' }}>
                  <p className="cp-muted cp-small">No health records yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="cp-col-4" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Quick Vitals — Fix #13: uses vitalsDisplay from context */}
          <div className="cp-card cp-card--flat animate-fade-in-up" style={{ borderRadius: 'var(--radius-3xl)', padding: 28, animationDelay: '0.15s' }}>
            <h3 className="cp-section-title cp-mb-6">Quick Vitals</h3>
            <div className="cp-flex cp-flex-col cp-gap-6">
              {vitalsDisplay.map(v => (
                <div key={v.label} className="cp-vital-row">
                  <div className="cp-flex cp-items-center cp-gap-4">
                    <div className={`cp-vital-icon cp-vital-icon--${v.variant}`}>
                      <span className="material-symbols-outlined">{v.icon}</span>
                    </div>
                    <div>
                      <p className="cp-muted cp-small" style={{ fontWeight: 500 }}>{v.label}</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-h)' }}>{v.value}</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--tertiary)', fontSize: 12, fontWeight: 800 }}>{v.status}</span>
                </div>
              ))}
              {vitalsDisplay.length === 0 && (
                <p className="cp-muted cp-small" style={{ textAlign: 'center' }}>No vitals recorded yet.</p>
              )}
            </div>
            <div className="cp-flex cp-gap-2 cp-mt-8">
              <button className="cp-btn cp-btn--secondary" style={{ flex: 1, borderRadius: 'var(--radius-full)' }} onClick={() => navigate('/vitals')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
                View History
              </button>
              <button className="cp-btn cp-btn--primary" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => navigate('/vitals')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Log New
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="cp-card cp-card--flat animate-fade-in-up" style={{ borderRadius: 'var(--radius-3xl)', padding: 28, animationDelay: '0.25s' }}>
            <div className="cp-flex cp-justify-between cp-items-center cp-mb-6">
              <h3 className="cp-section-title">Notifications</h3>
              {notifications.length > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--error)' }} />}
            </div>
            <div className="cp-flex cp-flex-col cp-gap-6">
              {notifications.map(n => (
                <div key={n.id} className="cp-notif-item" style={{ opacity: n.dimmed ? 0.6 : 1 }}>
                  <div className={`cp-notif-bar cp-notif-bar--${n.barColor}`} />
                  <div className="cp-notif-body">
                    <div className="cp-notif-title">{n.title}</div>
                    <div className="cp-notif-desc">{n.description}</div>
                    <div className="cp-notif-time" style={{ color: n.timeColor }}>{n.time}</div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="cp-muted cp-small" style={{ textAlign: 'center' }}>You're all caught up!</p>
              )}
            </div>
          </div>

          {/* Queue shortcut */}
          <button
            className="cp-card animate-fade-in-up"
            style={{ borderRadius: 'var(--radius-3xl)', padding: 24, cursor: 'pointer', textAlign: 'left', animationDelay: '0.35s', background: 'linear-gradient(135deg, var(--primary), #0055a4)', border: 'none' }}
            onClick={() => navigate('/queue')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff', marginBottom: 12, display: 'block' }}>queue</span>
            <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>Patient Queue</h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Check your position in today's clinic queue.</p>
          </button>
        </aside>
      </div>
    </div>
  );
}
