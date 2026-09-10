import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ragSearch } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Topbar() {
  const [searchVal, setSearchVal] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { setSidebarOpen } = useApp();

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  return (
    <header className="topbar">
      <button
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, display: 'none' }}
        className="menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      <div className="topbar-search">
        <span className="search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 16 }}>🔍</span>
        <input
          type="text"
          placeholder="Search books, authors, topics… (Press Enter)"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearch}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications" onClick={() => navigate('/reservations')}>
          🔔
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" title="AI Chat" onClick={() => navigate('/chat')}>
          🤖
        </button>
        <button
          style={{
            background: 'var(--gradient-1)',
            border: 'none',
            borderRadius: '50%',
            width: 36, height: 36,
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/profile')}
          title="My Profile"
        >
          AJ
        </button>
      </div>
    </header>
  );
}
