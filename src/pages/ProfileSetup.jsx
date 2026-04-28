import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfileSetup() {
  const { completeProfile, profileComplete } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', age: '', gender: '', bloodGroup: '', allergies: '' });

  useEffect(() => {
    if (profileComplete) {
      navigate('/');
    }
  }, [profileComplete, navigate]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender) return;
    completeProfile(form);
    navigate('/');
  };

  return (
    <div className="cp-auth-wrap">
      <div className="cp-auth-card animate-fade-in-up" style={{ width: 520 }}>
        <div className="cp-auth-brand">
          <div className="cp-brand-mark">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cardiology</span>
          </div>
          Care OS
        </div>

        <h1 className="cp-auth-title">Complete Your Profile</h1>
        <p className="cp-auth-sub">Help us personalize your healthcare experience.</p>

        <form className="cp-form" onSubmit={handleSubmit}>
          <div className="cp-form-group">
            <label className="cp-label">Full Name *</label>
            <input
              className="cp-input"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="cp-form-row">
            <div className="cp-form-group">
              <label className="cp-label">Age *</label>
              <input
                className="cp-input"
                type="number"
                placeholder="Your age"
                value={form.age}
                onChange={e => update('age', e.target.value)}
                min={1}
                max={120}
                required
              />
            </div>
            <div className="cp-form-group">
              <label className="cp-label">Gender *</label>
              <select
                className="cp-select"
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="cp-form-row">
            <div className="cp-form-group">
              <label className="cp-label">Blood Group</label>
              <select
                className="cp-select"
                value={form.bloodGroup}
                onChange={e => update('bloodGroup', e.target.value)}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="cp-form-group">
              <label className="cp-label">Known Allergies</label>
              <input
                className="cp-input"
                placeholder="e.g. Penicillin, Dust"
                value={form.allergies}
                onChange={e => update('allergies', e.target.value)}
              />
            </div>
          </div>

          <button
            className="cp-btn cp-btn--primary cp-btn--full cp-btn--lg cp-mt-4"
            type="submit"
            disabled={!form.name || !form.age || !form.gender}
          >
            <span className="material-symbols-outlined">check_circle</span>
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
