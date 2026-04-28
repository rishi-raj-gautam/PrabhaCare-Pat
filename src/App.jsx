import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import AuthPage from './pages/AuthPage'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import DoctorDiscovery from './pages/DoctorDiscovery'
import DoctorProfile from './pages/DoctorProfile'
import AppointmentBooking from './pages/AppointmentBooking'
import Consultation from './pages/Consultation'
import HealthRecords from './pages/HealthRecords'
import AppointmentHistory from './pages/AppointmentHistory'
import PatientQueue from './pages/PatientQueue'
import Settings from './pages/Settings'
import Vitals from './pages/Vitals'
import './App.css'

function ProtectedRoute({ children }) {
  const { isLoggedIn, profileComplete, isLoading } = useApp();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (!profileComplete) return <Navigate to="/profile-setup" replace />;
  return children;
}

export default function App() {
  const { isLoggedIn } = useApp();

  return (
    <div className="cp-app">
      {isLoggedIn && <Navbar />}
      {isLoggedIn && <BottomNav />}

      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><DoctorDiscovery /></ProtectedRoute>} />
        <Route path="/doctor/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
        <Route path="/booking/:doctorId" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
        <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
        <Route path="/consultation/:appointmentId" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><AppointmentHistory /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><PatientQueue /></ProtectedRoute>} />
        <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
