import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { login, signup, isLoggedIn, profileComplete, isLoading } = useApp();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      if (profileComplete) {
        navigate('/');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [isLoggedIn, profileComplete, navigate]);

  // Reset fields when toggling
  useEffect(() => {
    if (!isLogin) {
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setOccupation('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setAvatarUrl('');
    }
  }, [isLogin]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 5MB`);
      e.target.value = '';
      return;
    }
    
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/avatar`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setAvatarUrl(data.avatarUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (isLogin) {
      if (!email || !password) return setError("Please enter email and password");
      const res = await login(email, password);
      if (res.ok) {
          navigate('/');
      } else {
          setError(res.error || "Login failed. Please check credentials.");
      }
    } else {
      if (!name || !email || !password || !phone) return setError("Please fill all required fields");
      const res = await signup(name, phone, email, password, occupation, emergencyContactName, emergencyContactPhone, avatarUrl);
      if (res.ok) {
          navigate('/profile-setup');
      } else {
          setError(res.error || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="cp-auth-wrap">
      <div className="cp-auth-card animate-fade-in-up">
        <div className="cp-auth-brand">
          <div className="cp-brand-mark">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cardiology</span>
          </div>
          PrabhaCare Patient
        </div>

        <h1 className="cp-auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="cp-auth-sub">
          {isLogin 
            ? "Your health journey starts here. Sign in to continue." 
            : "Sign up to book appointments and view your health records."}
        </p>

        {error && <div style={{color: 'var(--critical)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold'}}>{error}</div>}

        <form className="cp-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="cp-form-group">
                <label className="cp-label">Full Name</label>
                <input
                    className="cp-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
              </div>
              <div className="cp-form-group">
                <label className="cp-label">Phone Number</label>
                <input
                    className="cp-input"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="cp-form-group">
                <label className="cp-label">Occupation (Optional)</label>
                <input
                    className="cp-input"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                />
              </div>
              <div className="cp-flex cp-gap-4">
                <div className="cp-form-group" style={{ flex: 1 }}>
                  <label className="cp-label">Emergency Contact Name (Optional)</label>
                  <input
                      className="cp-input"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={emergencyContactName}
                      onChange={e => setEmergencyContactName(e.target.value)}
                  />
                </div>
                <div className="cp-form-group" style={{ flex: 1 }}>
                  <label className="cp-label">Emergency Contact Phone (Optional)</label>
                  <input
                      className="cp-input"
                      type="tel"
                      placeholder="e.g. 1234567890"
                      value={emergencyContactPhone}
                      onChange={e => setEmergencyContactPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="cp-form-group">
                <label className="cp-label">Profile Picture (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {avatarUrl && (
                    <img src={avatarUrl} alt="Preview" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                    style={{ fontSize: 14 }}
                  />
                  {isUploading && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Uploading...</span>}
                </div>
              </div>
            </>
          )}

          <div className="cp-form-group">
            <label className="cp-label">Email Address</label>
            <input
                className="cp-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={isLogin}
            />
          </div>
          
          <div className="cp-form-group">
            <label className="cp-label">Password</label>
            <input
                className="cp-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
            />
          </div>

          <button
            className="cp-btn cp-btn--primary cp-btn--full cp-btn--lg"
            type="submit"
            disabled={isLoading || !email || !password || (!isLogin && (!name || !phone))}
          >
            {isLoading ? "Authenticating..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            type="button" 
            className="cp-btn cp-btn--ghost cp-btn--full" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ fontSize: 14, fontWeight: 600, border: '1px solid var(--outline-variant)' }}
          >
            {isLogin ? "New to PrabhaCare? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
