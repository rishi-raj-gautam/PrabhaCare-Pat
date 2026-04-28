import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/doctors', icon: 'search', label: 'Find Doctor' },
  { to: '/vitals', icon: 'monitor_heart', label: 'Vitals' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/records', icon: 'description', label: 'Records' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="cp-bottom-nav">
      {items.map(item => {
        const isActive = item.to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`cp-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
