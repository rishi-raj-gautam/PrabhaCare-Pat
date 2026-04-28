import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  const id = doctor._id || doctor.id;

  return (
    <div className="cp-doctor-card animate-fade-in-up">
      <div className="cp-doctor-photo">
        <img src={doctor.photo || doctor.avatarUrl || 'https://via.placeholder.com/150'} alt={doctor.name} />
        <div className={`cp-doctor-badge ${doctor.available !== false ? 'cp-doctor-badge--available' : 'cp-doctor-badge--next'}`}>
          <span className="cp-doctor-badge-dot" style={{ background: doctor.available !== false ? 'var(--tertiary)' : 'var(--outline-variant)' }} />
          {doctor.availableText || 'Available Today'}
        </div>
      </div>

      <div className="cp-doctor-info">
        <div className="cp-flex cp-justify-between cp-items-start" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="cp-doctor-name">{doctor.name}</div>
            <div className="cp-doctor-spec">{doctor.specialty} {doctor.qualifications ? `• ${doctor.qualifications}` : ''}</div>
            <div className="cp-doctor-meta">
              <div className="cp-doctor-rating">
                <span className="material-symbols-outlined filled">star</span>
                {doctor.rating || '4.9'} ({(doctor.reviews || 42) >= 1000 ? `${((doctor.reviews || 42) / 1000).toFixed(1)}k` : (doctor.reviews || 42)} Reviews)
              </div>
              <div className="cp-doctor-exp">{doctor.experience || '10+'} Years Experience</div>
            </div>
            {doctor.tags && (
              <div className="cp-doctor-tags">
                {doctor.tags.map(tag => (
                  <span key={tag} className="cp-doctor-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="cp-doctor-fee-section">
            <div className="cp-doctor-fee-label">Consultation Fee</div>
            <div className="cp-doctor-fee">₹{(doctor.fee || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="cp-doctor-actions">
          <button
            className="cp-btn cp-btn--secondary"
            onClick={() => navigate(`/doctor/${id}`)}
          >
            View Profile
          </button>
          <button
            className="cp-btn cp-btn--primary"
            onClick={() => navigate(`/booking/${id}`)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
