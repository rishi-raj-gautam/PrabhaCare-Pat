import { useParams, useNavigate } from 'react-router-dom';
import { DOCTORS } from '../data/mockData';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = DOCTORS.find(d => d.id === id);

  if (!doctor) {
    return (
      <div className="cp-page" style={{ textAlign: 'center', paddingTop: 160 }}>
        <h2 className="cp-title">Doctor not found</h2>
        <button className="cp-btn cp-btn--primary cp-mt-6" onClick={() => navigate('/doctors')}>
          Browse Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-grid cp-grid--12">
        {/* Main Content */}
        <div className="cp-col-8">
          {/* Doctor Header */}
          <div className="cp-card animate-fade-in-up" style={{ marginBottom: 24 }}>
            <div className="cp-flex cp-gap-6" style={{ flexWrap: 'wrap' }}>
              <div className="cp-avatar cp-avatar--xl" style={{ borderRadius: 'var(--radius-xl)' }}>
                <img src={doctor.photo} alt={doctor.name} />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-h)', marginBottom: 4 }}>
                  {doctor.name}
                </h1>
                <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                  {doctor.specialty} • {doctor.qualifications}
                </p>
                <div className="cp-flex cp-items-center cp-gap-4 cp-mb-4">
                  <div className="cp-doctor-rating">
                    <span className="material-symbols-outlined filled" style={{ fontSize: 14, color: '#eab308' }}>star</span>
                    {doctor.rating} ({doctor.reviews >= 1000 ? `${(doctor.reviews / 1000).toFixed(1)}k` : doctor.reviews} Reviews)
                  </div>
                  <span className="cp-muted">{doctor.experience} Years Experience</span>
                </div>
                <div className="cp-flex cp-items-center cp-gap-2" style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>domain</span>
                  {doctor.hospital}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--outline)' }}>Consultation Fee</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-h)' }}>₹{doctor.fee.toLocaleString()}</div>
                {doctor.available && (
                  <span className="cp-tag cp-tag--success cp-tag--lg" style={{ marginTop: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tertiary)', display: 'inline-block' }} />
                    Available Today
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="cp-card animate-fade-in-up" style={{ marginBottom: 24, animationDelay: '0.1s' }}>
            <h2 className="cp-section-title cp-mb-4">About</h2>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{doctor.bio}</p>
          </div>

          {/* Education */}
          <div className="cp-card animate-fade-in-up" style={{ marginBottom: 24, animationDelay: '0.15s' }}>
            <h2 className="cp-section-title cp-mb-4">Education & Qualifications</h2>
            <div className="cp-flex cp-flex-col cp-gap-3">
              {doctor.education.map((edu, i) => (
                <div key={i} className="cp-flex cp-items-center cp-gap-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>school</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{edu}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div className="cp-card animate-fade-in-up" style={{ marginBottom: 24, animationDelay: '0.2s' }}>
            <h2 className="cp-section-title cp-mb-4">Specializations</h2>
            <div className="cp-flex cp-flex-wrap cp-gap-3">
              {doctor.tags.map(tag => (
                <span key={tag} className="cp-pill" style={{ fontSize: 14 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Available Slots Preview */}
          <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <h2 className="cp-section-title cp-mb-4">Available Slots</h2>
            <div className="cp-mb-4">
              <h4 className="cp-flex cp-items-center cp-gap-2 cp-mb-3" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>wb_sunny</span>
                Morning Slots
              </h4>
              <div className="cp-slot-grid">
                {doctor.slots.morning.map(slot => (
                  <button key={slot} className="cp-slot">{slot}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="cp-flex cp-items-center cp-gap-2 cp-mb-3" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>light_mode</span>
                Afternoon Slots
              </h4>
              <div className="cp-slot-grid">
                {doctor.slots.afternoon.map(slot => (
                  <button key={slot} className="cp-slot">{slot}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="cp-col-4">
          <div style={{ position: 'sticky', top: 88 }}>
            <button
              className="cp-btn cp-btn--primary cp-btn--full cp-btn--lg cp-mb-4 animate-fade-in-up"
              onClick={() => navigate(`/booking/${doctor.id}`)}
            >
              <span className="material-symbols-outlined">calendar_add_on</span>
              Book Appointment
            </button>

            <div className="cp-card cp-card--flat animate-fade-in-up" style={{ borderRadius: 'var(--radius-xl)', animationDelay: '0.1s' }}>
              <h4 className="cp-bold cp-small" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Reviews</h4>
              <p className="cp-muted cp-mt-2" style={{ fontSize: 14 }}>
                Patient reviews coming soon. {doctor.name} has {doctor.reviews.toLocaleString()}+ verified reviews.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
