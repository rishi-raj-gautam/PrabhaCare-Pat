import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function PatientQueue() {
  const navigate = useNavigate();
  const { appointments, queueInfo, fetchQueueInfo, profile } = useApp();
  const [loading, setLoading] = useState(false);

  // Find the patient's next upcoming BOOKED appointment
  const now = new Date();
  const nextAppt = appointments
    .filter(a => a.status === 'BOOKED' && new Date(a.startTime) >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  const doctorId = nextAppt?.doctorId?._id || nextAppt?.doctorId;
  const doctor = nextAppt?.doctorId || {};

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    fetchQueueInfo(doctorId).finally(() => setLoading(false));
  }, [doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const queue = queueInfo?.queue || [];
  const myPatientId = profile._id;

  // Find this patient's position in the queue
  const myPosition = queue.findIndex(a => {
    const pid = a.patientId?._id || a.patientId;
    return pid === myPatientId || (a.patientId?.name === profile.name);
  });
  const queuePosition = myPosition >= 0 ? myPosition + 1 : null;
  const totalInQueue = queue.filter(a => a.status === 'BOOKED').length;
  const completedBefore = queue.slice(0, myPosition).filter(a => a.status === 'COMPLETED').length;
  const pendingBefore = myPosition > 0 ? myPosition - completedBefore : 0;

  // Estimated wait: ~15 min per pending patient before this one
  const estimatedWaitMins = pendingBefore * 15;

  if (!nextAppt) {
    return (
      <div className="cp-page">
        <div className="cp-card" style={{ textAlign: 'center', padding: 64, maxWidth: 500, margin: '0 auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 16 }}>queue</span>
          <h2 style={{ fontWeight: 900, color: 'var(--text-h)', marginBottom: 12 }}>No Upcoming Appointment</h2>
          <p className="cp-muted" style={{ marginBottom: 24 }}>Book an appointment to see your queue position here.</p>
          <button className="cp-btn cp-btn--primary" onClick={() => navigate('/doctors')}>
            Find a Doctor
          </button>
        </div>
      </div>
    );
  }

  const apptDate = new Date(nextAppt.startTime);
  const dateStr = apptDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isVideo = nextAppt.type === 'VIDEO';

  return (
    <div className="cp-page">
      <section className="cp-page-header animate-fade-in-up">
        <div>
          <h1 className="cp-headline">Patient Queue</h1>
          <p className="cp-subtitle">Your real-time position for today's appointment.</p>
        </div>
      </section>

      <div className="cp-grid cp-grid--12" style={{ gap: 24 }}>
        {/* Queue Position Card */}
        <div className="cp-col-8">
          <div
            className="cp-card animate-fade-in-up"
            style={{
              borderRadius: 'var(--radius-3xl)', padding: 40, textAlign: 'center',
              background: 'linear-gradient(135deg, var(--primary-fixed), var(--secondary-container))',
              animationDelay: '0.1s'
            }}
          >
            {loading ? (
              <div>
                <p className="cp-muted">Loading queue...</p>
              </div>
            ) : queuePosition !== null ? (
              <>
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--primary)', marginBottom: 8 }}>
                  Your Position
                </p>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 52, fontWeight: 900,
                  boxShadow: '0 8px 32px rgba(0,72,141,0.3)'
                }}>
                  {queuePosition}
                </div>
                <h2 style={{ fontWeight: 900, color: 'var(--text-h)', marginBottom: 8 }}>
                  {queuePosition === 1 ? "You're Next!" : `${queuePosition - 1} patient${queuePosition > 2 ? 's' : ''} ahead`}
                </h2>
                {estimatedWaitMins > 0 && (
                  <p className="cp-muted" style={{ fontSize: 15 }}>
                    Estimated wait: <strong style={{ color: 'var(--primary)' }}>~{estimatedWaitMins} min</strong>
                  </p>
                )}
                {queuePosition === 1 && (
                  <div className="cp-flex cp-justify-center cp-mt-6">
                    <span className="cp-tag cp-tag--success cp-tag--lg">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notifications_active</span>
                      Doctor is ready
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', display: 'block', marginBottom: 12 }}>pending</span>
                <h2 style={{ fontWeight: 800, color: 'var(--text-h)', marginBottom: 8 }}>Queue Loading</h2>
                <p className="cp-muted">Your position will appear once today's clinic opens.</p>
              </>
            )}
          </div>

          {/* Queue Progress */}
          {queue.length > 0 && (
            <div className="cp-card animate-fade-in-up" style={{ marginTop: 20, borderRadius: 'var(--radius-2xl)', animationDelay: '0.2s' }}>
              <h3 className="cp-section-title cp-mb-4">Today's Queue ({totalInQueue} remaining)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {queue.map((a, i) => {
                  const isMe = i === myPosition;
                  const isDone = a.status === 'COMPLETED';
                  const patName = a.patientId?.name || `Patient ${i + 1}`;
                  const initials = patName.slice(0, 2).toUpperCase();
                  const t = new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={a._id || i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                        borderRadius: 'var(--radius-xl)',
                        background: isMe ? 'rgba(0,72,141,0.08)' : 'var(--surface-container-low)',
                        border: isMe ? '2px solid var(--primary)' : '2px solid transparent',
                        opacity: isDone ? 0.5 : 1,
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: isMe ? 'var(--primary)' : 'var(--surface-container)',
                        color: isMe ? '#fff' : 'var(--on-surface-variant)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800,
                      }}>
                        {isDone ? <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--tertiary)' }}>check</span> : (i + 1)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: isMe ? 800 : 600, color: 'var(--text-h)', fontSize: 14 }}>
                          {isMe ? 'You' : initials + '***'}
                          {isMe && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>← Your slot</span>}
                        </p>
                        <p className="cp-muted cp-small">{t} • {a.type === 'VIDEO' ? 'Video' : 'In-Person'}</p>
                      </div>
                      <span className={`cp-tag ${isDone ? 'cp-tag--success' : 'cp-tag--neutral'}`} style={{ fontSize: 11 }}>
                        {isDone ? 'Done' : 'Waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Appointment Details Sidebar */}
        <aside className="cp-col-4">
          <div className="cp-card animate-fade-in-up" style={{ borderRadius: 'var(--radius-2xl)', animationDelay: '0.15s' }}>
            <h3 className="cp-section-title cp-mb-6">Your Appointment</h3>
            <div className="cp-flex cp-items-center cp-gap-4 cp-mb-6">
              <div className="cp-avatar cp-avatar--lg" style={{ borderRadius: 'var(--radius-xl)' }}>
                <img src={doctor.avatarUrl || 'https://via.placeholder.com/150'} alt={doctor.name} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--text-h)' }}>{doctor.name || 'Your Doctor'}</h4>
                <p className="cp-muted cp-small">{doctor.specialty}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(194,198,212,0.2)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="cp-flex cp-justify-between">
                <span className="cp-muted cp-small">Date</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{dateStr}</span>
              </div>
              <div className="cp-flex cp-justify-between">
                <span className="cp-muted cp-small">Time</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{timeStr}</span>
              </div>
              <div className="cp-flex cp-justify-between">
                <span className="cp-muted cp-small">Type</span>
                <span className={`cp-tag ${isVideo ? 'cp-tag--primary' : 'cp-tag--neutral'}`} style={{ fontSize: 11 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{isVideo ? 'video_camera_front' : 'person'}</span>
                  {isVideo ? 'Video Call' : 'In-Person'}
                </span>
              </div>
              {doctor.fee && (
                <div className="cp-flex cp-justify-between">
                  <span className="cp-muted cp-small">Fee</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-h)' }}>₹{doctor.fee.toLocaleString()}</span>
                </div>
              )}
            </div>

            {isVideo && (
              <button
                className="cp-btn cp-btn--primary cp-btn--full cp-mt-6"
                style={{ borderRadius: 'var(--radius-full)' }}
                onClick={() => navigate('/consultation')}
              >
                <span className="material-symbols-outlined">videocam</span>
                Join Video Call
              </button>
            )}

            <button
              className="cp-btn cp-btn--ghost cp-btn--full cp-mt-3"
              style={{ borderRadius: 'var(--radius-full)' }}
              onClick={() => { if (doctorId) fetchQueueInfo(doctorId); }}
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh Queue
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
