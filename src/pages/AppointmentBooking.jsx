import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DOCTORS, CALENDAR_DAYS } from '../data/mockData';

export default function AppointmentBooking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { addAppointment, doctors, isLoading: appLoading } = useApp();

  const doctor = doctors.find(d => d._id === doctorId) || doctors[0] || DOCTORS[0];
  const [step, setStep] = useState(0); // Always start at type selection
  const [type, setType] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepProgress = step === 0 ? '0%' : step === 1 ? '50%' : '100%';

  const handleConfirm = async () => {
    if (!doctor || !selectedSlot) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const day = CALENDAR_DAYS[selectedDay];
      // Create a real Date for October 2026 (matching mock context)
      const scheduledDate = new Date(2026, 9, day.num); // Month is 0-indexed, 9 = Oct
      
      // Parse "09:00 AM" or "02:00 PM"
      const [time, modifier] = selectedSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startTime = new Date(scheduledDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // Default 1 hour duration

      const res = await addAppointment({
        doctorId: doctor._id,
        scheduledDate: scheduledDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type: (type === 'in-person' ? 'IN_PERSON' : 'VIDEO'),
        notes: `Initial booking via Patient App`,
        roomType: type === 'video' ? 'webrtc-generic' : 'manual'
      });

      if (res.ok) {
        setConfirmed(true);
      } else {
        setError(res.error || "Failed to book appointment");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="cp-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div className="animate-fade-in-up">
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'var(--tertiary-fixed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 40, color: 'var(--tertiary)' }}>check_circle</span>
          </div>
          <h1 className="cp-title cp-mb-2">Appointment Confirmed!</h1>
          <p className="cp-subtitle cp-mb-8">Your appointment with {doctor.name} has been booked successfully.</p>
          <div className="cp-flex cp-gap-4 cp-justify-center">
            <button className="cp-btn cp-btn--primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
            <button className="cp-btn cp-btn--secondary" onClick={() => navigate('/doctors')}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      {/* Stepper */}
      <div className="cp-stepper animate-fade-in-up">
        <div className="cp-stepper-line" />
        <div className="cp-stepper-progress" style={{ width: stepProgress }} />
        {['Type', 'Slot', 'Confirm'].map((label, i) => (
          <div key={label} className={`cp-step ${step >= i ? (step > i ? 'done' : 'active') : ''}`}>
            <div className="cp-step-circle">{step > i ? '✓' : i + 1}</div>
            <span className="cp-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="cp-grid cp-grid--12">
        {/* Sidebar: Doctor Context */}
        <div className="cp-col-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="cp-card cp-card--flat" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="cp-flex cp-items-center cp-gap-4 cp-mb-6">
              <div className="cp-avatar cp-avatar--lg cp-avatar--circle">
                <img src={doctor.avatarUrl || doctor.photo} alt={doctor.name} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-h)', fontSize: 17 }}>{doctor.name}</h3>
                <p className="cp-muted cp-small">{doctor.specialty}</p>
                <div className="cp-flex cp-items-center cp-gap-2 cp-mt-2">
                  <span className="material-symbols-outlined filled" style={{ fontSize: 14, color: '#eab308' }}>star</span>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                    {doctor.rating} ({doctor.reviews}+ reviews)
                  </span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(194,198,212,0.2)', paddingTop: 16 }}>
              <div className="cp-flex cp-justify-between cp-mb-3">
                <span className="cp-muted cp-small">Consultation Fee</span>
                <span className="cp-bold cp-small">₹{doctor.fee.toLocaleString()}.00</span>
              </div>
              <div className="cp-flex cp-justify-between">
                <span className="cp-muted cp-small">Wait Time</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tertiary)' }}>~15 mins</span>
              </div>
            </div>
          </div>

          <div className="cp-card cp-mt-6" style={{ borderRadius: 'var(--radius-xl)' }}>
            <h4 className="cp-bold cp-small" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Need help?</h4>
            <p className="cp-muted cp-small cp-mt-2" style={{ lineHeight: 1.6 }}>
              Contact our health concierge for assistance with medical records or insurance.
            </p>
            <button className="cp-btn cp-btn--secondary cp-btn--full cp-mt-4">Call Support</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="cp-col-8">
          <div className="cp-card cp-card--elevated animate-fade-in-up" style={{ borderRadius: 'var(--radius-2xl)', padding: 32, animationDelay: '0.15s' }}>
            {/* Step 0: Select Type */}
            {step === 0 && (
              <>
                <h2 className="cp-title cp-mb-2">Select Consultation Type</h2>
                <p className="cp-subtitle cp-mb-8">Choose how you'd like to consult with {doctor.name}.</p>
                <div className="cp-grid cp-grid--2" style={{ gap: 16 }}>
                  {[
                    { value: 'in-person', icon: 'person', title: 'In-Person Visit', desc: 'Visit the clinic for a face-to-face consultation' },
                    { value: 'video', icon: 'video_camera_front', title: 'Video Consultation', desc: 'Connect online from the comfort of your home' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      className={`cp-card ${type === opt.value ? '' : 'cp-card--flat'}`}
                      style={{
                        textAlign: 'left', cursor: 'pointer', border: type === opt.value ? '2px solid var(--primary)' : '2px solid transparent',
                        background: type === opt.value ? 'rgba(0,72,141,0.04)' : 'var(--surface-container-low)',
                      }}
                      onClick={() => setType(opt.value)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 12 }}>{opt.icon}</span>
                      <h3 style={{ fontWeight: 800, color: 'var(--text-h)', marginBottom: 4 }}>{opt.title}</h3>
                      <p className="cp-muted cp-small">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="cp-flex cp-justify-center cp-mt-8">
                  <button className="cp-btn cp-btn--primary cp-btn--lg" disabled={!type} onClick={() => setStep(1)}>
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 1: Select Slot */}
            {step === 1 && (
              <>
                <h2 className="cp-title cp-mb-2">Select a Time Slot</h2>
                <p className="cp-subtitle cp-mb-8">Choose a convenient date and time for your consultation with {doctor.name}.</p>

                {/* Calendar Strip */}
                <div className="cp-calendar-strip cp-mb-8">
                  {CALENDAR_DAYS.map((day, i) => (
                    <button
                      key={i}
                      className={`cp-cal-day ${selectedDay === i ? 'selected' : ''}`}
                      onClick={() => setSelectedDay(i)}
                    >
                      <span className="cp-cal-day-name">{day.name}</span>
                      <span className="cp-cal-day-num">{day.num}</span>
                    </button>
                  ))}
                </div>

                {/* Morning Slots */}
                <div className="cp-mb-6">
                  <h4 className="cp-flex cp-items-center cp-gap-2 cp-mb-4" style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-h)' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>wb_sunny</span>
                    Morning Slots
                  </h4>
                  <div className="cp-slot-grid">
                    {doctor.slots.morning.map((slot, i) => (
                      <button
                        key={slot}
                        className={`cp-slot ${selectedSlot === slot ? 'selected' : ''}`}
                        disabled={i === 2}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div className="cp-mb-6">
                  <h4 className="cp-flex cp-items-center cp-gap-2 cp-mb-4" style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-h)' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>light_mode</span>
                    Afternoon Slots
                  </h4>
                  <div className="cp-slot-grid">
                    {doctor.slots.afternoon.map(slot => (
                      <button
                        key={slot}
                        className={`cp-slot ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selection Summary */}
                <div style={{ borderTop: '1px solid rgba(194,198,212,0.2)', paddingTop: 24, marginTop: 24 }} className="cp-flex cp-justify-between cp-items-center" >
                  <div className="cp-flex cp-items-center cp-gap-4">
                    <div style={{ padding: 12, background: 'var(--tertiary-fixed)', borderRadius: 'var(--radius-xl)' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>
                        {type === 'in-person' ? 'person' : 'video_camera_front'}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 500, textTransform: 'uppercase' }}>Selection</p>
                      <p className="cp-bold cp-small">
                        {type === 'in-person' ? 'In-Person' : 'Video Call'} • Oct {CALENDAR_DAYS[selectedDay].num}, {selectedSlot || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="cp-flex cp-gap-3">
                    {!doctorId && (
                      <button className="cp-btn cp-btn--ghost" onClick={() => setStep(0)}>Back</button>
                    )}
                    <button
                      className="cp-btn cp-btn--primary cp-btn--lg"
                      disabled={!selectedSlot}
                      onClick={() => setStep(2)}
                    >
                      Confirm & Book
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <>
                <h2 className="cp-title cp-mb-2">Confirm Your Booking</h2>
                <p className="cp-subtitle cp-mb-8">Please review your appointment details below.</p>

                <div className="cp-card cp-card--flat cp-mb-6" style={{ borderRadius: 'var(--radius-xl)' }}>
                  <div className="cp-flex cp-items-center cp-gap-4 cp-mb-4">
                    <div className="cp-avatar cp-avatar--md cp-avatar--circle">
                      <img src={doctor.avatarUrl || doctor.photo} alt={doctor.name} />
                    </div>
                    <div>
                      <h3 className="cp-bold">{doctor.name}</h3>
                      <p className="cp-muted cp-small">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="cp-flex cp-flex-col cp-gap-3" style={{ borderTop: '1px solid rgba(194,198,212,0.2)', paddingTop: 16 }}>
                    <div className="cp-flex cp-justify-between">
                      <span className="cp-muted">Type</span>
                      <span className="cp-bold">{type === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}</span>
                    </div>
                    <div className="cp-flex cp-justify-between">
                      <span className="cp-muted">Date</span>
                      <span className="cp-bold">{CALENDAR_DAYS[selectedDay].name}, Oct {CALENDAR_DAYS[selectedDay].num}</span>
                    </div>
                    <div className="cp-flex cp-justify-between">
                      <span className="cp-muted">Time</span>
                      <span className="cp-bold">{selectedSlot}</span>
                    </div>
                    <div className="cp-flex cp-justify-between">
                      <span className="cp-muted">Fee</span>
                      <span className="cp-bold" style={{ fontSize: 18 }}>₹{doctor.fee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {error && <div style={{ color: 'var(--critical)', marginBottom: 16, fontWeight: 'bold' }}>{error}</div>}
                <div className="cp-flex cp-gap-3">
                  <button className="cp-btn cp-btn--ghost" onClick={() => setStep(1)} disabled={isSubmitting}>Back</button>
                  <button className="cp-btn cp-btn--primary cp-btn--lg cp-flex-1" onClick={handleConfirm} disabled={isSubmitting}>
                    <span className="material-symbols-outlined">check_circle</span>
                    {isSubmitting ? "Booking..." : "Confirm Appointment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
