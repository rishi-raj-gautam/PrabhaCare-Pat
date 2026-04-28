import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { profile, isLoggedIn } = useApp();
  const firstName = profile.name?.split(' ')[0] || 'Patient';

  return (
    <nav className="cp-navbar">
      <div className="cp-navbar-inner">
        <NavLink to="/" className="cp-brand">
          <div className="cp-brand-mark">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cardiology</span>
          </div>
          PrabhaCare
        </NavLink>

        <div className="cp-nav-links">
          <NavLink to="/" className={({ isActive }) => `cp-nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => `cp-nav-link ${isActive ? 'active' : ''}`}>
            Find Doctor
          </NavLink>
          <NavLink to="/records" className={({ isActive }) => `cp-nav-link ${isActive ? 'active' : ''}`}>
            My Records
          </NavLink>
          <NavLink to="/vitals" className={({ isActive }) => `cp-nav-link ${isActive ? 'active' : ''}`}>
            Vitals
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `cp-nav-link ${isActive ? 'active' : ''}`}>
            History
          </NavLink>
        </div>

        <div className="cp-nav-actions">
          <button className="cp-icon-btn" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {isLoggedIn ? (
            <NavLink to="/settings" className="cp-icon-btn" title="Profile">
              <span className="material-symbols-outlined">account_circle</span>
            </NavLink>
          ) : (
            <NavLink to="/auth" className="cp-btn cp-btn--primary cp-btn--sm">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
