import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/chat', label: 'AI Assistant', icon: '🤖', badge: 'AI' },
  ]},
  { section: 'Library', items: [
    { path: '/search', label: 'Search Books', icon: '🔍' },
    { path: '/popular', label: 'Popular Books', icon: '🔥' },
    { path: '/recommendations', label: 'For You', icon: '✨' },
  ]},
  { section: 'My Library', items: [
    { path: '/profile', label: 'My Profile', icon: '👤' },
    { path: '/borrowings', label: 'My Borrowings', icon: '📖' },
    { path: '/reservations', label: 'Reservations', icon: '📅' },
  ]},
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStudent, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <div className="logo-title">LibraryAI</div>
          <div className="logo-sub">Smart University Library</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <button
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-mini" onClick={() => navigate('/profile')}>
            <div className="avatar">{currentStudent.avatar}</div>
            <div className="profile-info">
              <div className="name">{currentStudent.name}</div>
              <div className="dept">{currentStudent.department} · Y{currentStudent.year}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
