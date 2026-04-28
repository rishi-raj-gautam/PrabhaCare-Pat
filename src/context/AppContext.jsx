import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '', age: '', gender: '', bloodGroup: '',
  allergies: [], phone: '', email: ''
};

// Map raw Vital DB document into display-ready format
function buildVitalsDisplay(vitalsArr) {
  if (!vitalsArr || vitalsArr.length === 0) return [];
  const latest = vitalsArr[0];
  const m = latest.metrics || {};
  const display = [];

  if (m.bpSys && m.bpDia) {
    const sys = Number(m.bpSys); const dia = Number(m.bpDia);
    const status = sys >= 140 || dia >= 90 ? 'High' : sys < 90 ? 'Low' : 'Normal';
    display.push({ label: 'Blood Pressure', icon: 'favorite', value: `${sys}/${dia} mmHg`, status, variant: status === 'Normal' ? 'primary' : 'critical' });
  }
  if (m.heartRate) {
    const hr = Number(m.heartRate);
    const status = hr > 100 ? 'High' : hr < 60 ? 'Low' : 'Normal';
    display.push({ label: 'Heart Rate', icon: 'cardiology', value: `${hr} bpm`, status, variant: status === 'Normal' ? 'primary' : 'warning' });
  }
  if (m.spo2) {
    const sp = Number(m.spo2);
    const status = sp < 95 ? 'Low' : 'Normal';
    display.push({ label: 'SpO₂', icon: 'air', value: `${sp}%`, status, variant: status === 'Normal' ? 'primary' : 'critical' });
  }
  if (m.glucoseFasting) {
    const g = Number(m.glucoseFasting);
    const status = g > 126 ? 'High' : g < 70 ? 'Low' : 'Normal';
    display.push({ label: 'Glucose', icon: 'water_drop', value: `${g} mg/dL`, status, variant: status === 'Normal' ? 'primary' : 'warning' });
  }
  if (m.temperature) {
    const t = Number(m.temperature);
    const status = t > 37.5 ? 'Fever' : t < 36 ? 'Low' : 'Normal';
    display.push({ label: 'Temperature', icon: 'thermostat', value: `${t}°C`, status, variant: status === 'Normal' ? 'primary' : 'warning' });
  }
  if (m.respiratoryRate) {
    const rr = Number(m.respiratoryRate);
    const status = rr > 20 ? 'High' : rr < 12 ? 'Low' : 'Normal';
    display.push({ label: 'Resp. Rate', icon: 'pulmonology', value: `${rr} br/min`, status, variant: status === 'Normal' ? 'primary' : 'warning' });
  }
  return display;
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cp_token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileComplete, setProfileComplete] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [notifications] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('cp_theme') || 'light');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cp_theme', theme);
  }, [theme]);

  // Unified API Fetcher
  const fetchAPI = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  }, [token]);

  // Load Patient Data when Token arrives
  useEffect(() => {
    if (!token) return;
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const { id } = JSON.parse(jsonPayload);

        const [profData, apptData, recData, vitData, docsData] = await Promise.all([
          fetchAPI(`/patients/${id}`),
          fetchAPI(`/appointments/patient/${id}`),
          fetchAPI(`/patients/${id}/records`),
          fetchAPI(`/patients/${id}/vitals`),
          fetchAPI('/doctors')
        ]);

        setProfile(profData);
        setProfileComplete(!!profData.age);
        setAppointments(apptData);
        setRecords(recData);
        setVitals(vitData);
        setDoctors(docsData);
      } catch (err) {
        console.error('Failed to load user data:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const data = await fetchAPI('/auth/patient/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(data.token);
      localStorage.setItem('cp_token', data.token);
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, phone, email, password, occupation, emergencyContactName, emergencyContactPhone, avatarUrl) => {
    try {
      setIsLoading(true);
      const data = await fetchAPI('/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, password, occupation, emergencyContactName, emergencyContactPhone, avatarUrl })
      });
      setToken(data.token);
      localStorage.setItem('cp_token', data.token);
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setProfileComplete(false);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('cp_token');
    setAppointments([]);
    setRecords([]);
    setVitals([]);
    setQueueInfo(null);
  };

  const completeProfile = async (data) => {
    try {
      setIsLoading(true);
      const updated = await fetchAPI(`/patients/${profile._id}`, { method: 'PUT', body: JSON.stringify(data) });
      setProfile(updated);
      setProfileComplete(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addAppointment = async (apptData) => {
    try {
      setIsLoading(true);
      const newAppt = await fetchAPI('/appointments', { method: 'POST', body: JSON.stringify(apptData) });
      setAppointments(prev => [newAppt, ...prev]);
      return { ok: true, appointment: newAppt };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAppointments = async () => {
    if (!profile?._id) return;
    try {
      const apptData = await fetchAPI(`/appointments/patient/${profile._id}`);
      setAppointments(apptData);
    } catch (err) {
      console.error('Failed to refresh appointments:', err);
    }
  };

  // POST new vitals entry to backend → persist in MongoDB
  const addVital = async (metrics) => {
    try {
      setIsLoading(true);
      const newVital = await fetchAPI('/records/vitals', {
        method: 'POST',
        body: JSON.stringify({ patientId: profile._id, metrics })
      });
      // Prepend so latest is always first (matches backend sort order)
      setVitals(prev => [newVital, ...prev]);
      return { ok: true, vital: newVital };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the doctor's queue for today to determine patient's position
  const fetchQueueInfo = async (doctorId) => {
    if (!doctorId) return;
    try {
      const queue = await fetchAPI(`/appointments/queue/${doctorId}`);
      setQueueInfo({ doctorId, queue });
      return queue;
    } catch (err) {
      console.error('Queue fetch failed:', err);
      return [];
    }
  };

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Derived vitals display format for Dashboard
  const vitalsDisplay = buildVitalsDisplay(vitals);

  return (
    <AppContext.Provider value={{
      isLoggedIn, login, signup, logout, isLoading,
      profile, setProfile, completeProfile, profileComplete,
      appointments, addAppointment, refreshAppointments,
      records, notifications, vitals, vitalsDisplay, addVital,
      queueInfo, fetchQueueInfo,
      doctors,
      theme, toggleTheme, fetchAPI
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
