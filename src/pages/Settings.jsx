import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

const SETTINGS_NAV = [
  { id: 'profile', icon: 'person', label: 'Edit Profile' },
  { id: 'family', icon: 'family_restroom', label: 'Family Members' },
  { id: 'privacy', icon: 'shield', label: 'Privacy & Security' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'appearance', icon: 'palette', label: 'Appearance' },
  { id: 'abha', icon: 'qr_code', label: 'ABHA ID' },
];

export default function Settings() {
  const { profile, setProfile, completeProfile, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Only JPG, PNG, and WebP images are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 5MB`);
      e.target.value = '';
      return;
    }
    
    setIsUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/avatar`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      update('avatarUrl', data.avatarUrl);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await completeProfile(form);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to save profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="cp-page">
      <h1 className="cp-headline cp-mb-8 animate-fade-in-up">Settings</h1>

      <div className="cp-grid cp-grid--12">
        {/* Sidebar Nav */}
        <aside className="cp-col-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="cp-settings-nav">
            {SETTINGS_NAV.map(item => (
              <button
                key={item.id}
                className={`cp-settings-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="cp-btn cp-btn--danger cp-btn--full cp-mt-8"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <div className="cp-col-9">
          {activeSection === 'profile' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-6">Edit Profile</h2>
              {errorMsg && <div style={{color: 'var(--critical)', marginBottom: '1rem', fontWeight: 'bold'}}>{errorMsg}</div>}
              <form className="cp-form" onSubmit={handleSave}>
                <div className="cp-form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', overflow: 'hidden' }}>
                    {form.avatarUrl ? <img src={form.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.name ? form.name.charAt(0) : 'P')}
                  </div>
                  <div>
                    <label className="cp-btn cp-btn--secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined">upload</span>
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="cp-form-group">
                  <label className="cp-label">Full Name</label>
                  <input className="cp-input" value={form.name || ''} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-label">Age</label>
                    <input className="cp-input" type="number" value={form.age} onChange={e => update('age', e.target.value)} />
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-label">Gender</label>
                    <select className="cp-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="">Select</option>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-label">Blood Group</label>
                    <select className="cp-select" value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-label">Phone</label>
                    <input className="cp-input" value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                </div>
                <div className="cp-form-group">
                  <label className="cp-label">Known Allergies</label>
                  <input className="cp-input" placeholder="e.g. Penicillin, Dust" value={form.allergies} onChange={e => update('allergies', e.target.value)} />
                </div>
                <div className="cp-flex cp-gap-3 cp-mt-4">
                  <button className="cp-btn cp-btn--primary" type="submit">
                    <span className="material-symbols-outlined">save</span>
                    Save Changes
                  </button>
                  {saved && <span className="cp-tag cp-tag--success cp-tag--lg">Saved!</span>}
                </div>
              </form>
            </div>
          )}

          {activeSection === 'family' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-4">Family Members</h2>
              <p className="cp-subtitle cp-mb-6">Manage family members to book appointments on their behalf.</p>
              <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--muted)', marginBottom: 12, display: 'block' }}>group_add</span>
                <p className="cp-muted">No family members added yet.</p>
                <button className="cp-btn cp-btn--primary cp-mt-4">
                  <span className="material-symbols-outlined">add</span>
                  Add Family Member
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-6">Privacy & Security</h2>
              <div className="cp-flex cp-flex-col cp-gap-4">
                {[
                  { label: 'Share health data with doctors', desc: 'Allow doctors to view your health records during consultations', checked: true },
                  { label: 'Medicine reminders', desc: 'Receive push notifications for medication schedules', checked: true },
                  { label: 'Marketing communications', desc: 'Receive health tips and promotional emails', checked: false },
                ].map((item, i) => (
                  <div key={i} className="cp-flex cp-justify-between cp-items-center" style={{ padding: '16px 0', borderBottom: '1px solid rgba(194,198,212,0.15)' }}>
                    <div>
                      <div className="cp-bold">{item.label}</div>
                      <div className="cp-muted cp-small">{item.desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 28 }}>
                      <input type="checkbox" defaultChecked={item.checked} style={{ display: 'none' }} />
                      <span style={{
                        display: 'block', width: 48, height: 28, borderRadius: 14,
                        background: item.checked ? 'var(--primary)' : 'var(--outline-variant)',
                        cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
                      }}>
                        <span style={{
                          position: 'absolute', top: 3, left: item.checked ? 23 : 3,
                          width: 22, height: 22, borderRadius: '50%', background: 'white',
                          transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-6">Notification Preferences</h2>
              <div className="cp-flex cp-flex-col cp-gap-4">
                {[
                  { label: 'Appointment Reminders', checked: true },
                  { label: 'Medicine Reminders', checked: true },
                  { label: 'Follow-up Alerts', checked: true },
                  { label: 'Report Results', checked: true },
                  { label: 'Health Tips', checked: false },
                ].map((item, i) => (
                  <label key={i} className="cp-checkbox" style={{ padding: '12px 0', borderBottom: '1px solid rgba(194,198,212,0.1)' }}>
                    <input type="checkbox" defaultChecked={item.checked} />
                    <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-6">Appearance</h2>
              <div className="cp-flex cp-items-center cp-justify-between" style={{ padding: '16px 0' }}>
                <div>
                  <div className="cp-bold">Dark Mode</div>
                  <div className="cp-muted cp-small">Switch between light and dark themes</div>
                </div>
                <button className="cp-btn cp-btn--secondary" onClick={toggleTheme}>
                  <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'abha' && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="cp-title cp-mb-4">ABHA ID Linking</h2>
              <p className="cp-subtitle cp-mb-6">
                Link your Ayushman Bharat Health Account (ABHA) to access your national health records.
              </p>
              <div className="cp-card cp-card--flat" style={{ textAlign: 'center', padding: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 12, display: 'block' }}>qr_code</span>
                <p className="cp-bold cp-mb-2">Coming Soon</p>
                <p className="cp-muted cp-small">ABHA integration will be available in a future update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
