import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getStats, getStudent, getPopularBooks, getTrendingBooks } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';

function StatCard({ icon, value, label, change, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${change.startsWith('+') ? 'up' : 'down'}`}>{change}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [student, setStudent] = useState(null);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useApp();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, studentRes, popularRes, trendingRes] = await Promise.all([
          getStats(), getStudent(DEMO_STUDENT_ID), getPopularBooks(), getTrendingBooks()
        ]);
        setStats(statsRes.data);
        setStudent(studentRes.data);
        setPopular(popularRes.data.books || []);
        setTrending(trendingRes.data.books || []);
      } catch (e) {
        addToast('Could not load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const dueBooks = student?.borrowedDetails?.filter(b => {
    const days = Math.ceil((new Date(b.dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 3 && days >= 0;
  }) || [];

  if (loading) return (
    <div className="page-content">
      <div className="loading-overlay"><div className="spinner" style={{ width: 36, height: 36 }} /><span>Loading dashboard…</span></div>
    </div>
  );

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="dashboard-hero">
        <div>
          <div className="hero-greeting">Good day 👋</div>
          <div className="hero-name">Welcome back, {student?.name?.split(' ')[0] || 'Student'}!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            {student?.department} · Year {student?.year} · {student?.membershipType} Member
          </div>
          <div className="hero-points">⭐ {student?.points || 0} Library Points</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 }}>
          <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Currently Borrowed</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{student?.borrowedBooks?.length || 0} books</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>of 5 allowed</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${((student?.borrowedBooks?.length || 0) / 5) * 100}%` }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            🤖 Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 mb-4" style={{ marginBottom: 24 }}>
        <StatCard icon="📚" value={stats?.totalBooks || 0} label="Total Books" colorClass="blue" change="+2 this month" />
        <StatCard icon="✅" value={stats?.availableCopies || 0} label="Available Copies" colorClass="green" />
        <StatCard icon="📖" value={stats?.activeBorrowings || 0} label="Active Borrowings" colorClass="sky" />
        <StatCard icon="📅" value={stats?.activeReservations || 0} label="Reservations" colorClass="amber" />
      </div>

      {/* Alerts */}
      {dueBooks.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Books Due Soon</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {dueBooks.map(b => b.bookTitle).join(', ')} — due within 3 days
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/borrowings')}>
            View Borrowings
          </button>
        </div>
      )}

      {/* Currently Borrowed */}
      {student?.borrowedDetails?.length > 0 && (
        <div className="card mb-4" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <span className="section-title">📖 Currently Borrowed</span>
            <button className="btn-link" onClick={() => navigate('/borrowings')}>View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.borrowedDetails.map(b => {
                  const daysLeft = Math.ceil((new Date(b.dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-light)' }} onClick={() => navigate(`/book/${b.bookId}`)}>{b.bookTitle}</div>
                      </td>
                      <td className="text-muted text-sm">{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ color: daysLeft <= 3 ? 'var(--warning)' : 'var(--text)', fontWeight: daysLeft <= 3 ? 600 : 400 }}>
                          {new Date(b.dueDate).toLocaleDateString()} {daysLeft <= 3 && `(${daysLeft}d left)`}
                        </span>
                      </td>
                      <td><span className="status-badge status-borrowed">Borrowed</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Two column section */}
      <div className="grid grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Recommendations */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">✨ Recommended for You</span>
            <button className="btn-link" onClick={() => navigate('/recommendations')}>See all →</button>
          </div>
          {student?.recommendations?.slice(0, 3).map(book => (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <div style={{ width: 40, height: 52, borderRadius: 6, background: book.coverColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author.split(',')[0]}</div>
              </div>
              <span className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`} style={{ fontSize: 11 }}>
                {book.availableCopies > 0 ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>

        {/* Reservations */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">📅 Active Reservations</span>
            <button className="btn-link" onClick={() => navigate('/reservations')}>View all →</button>
          </div>
          {student?.reservedDetails?.length > 0 ? student.reservedDetails.map(r => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.bookTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expires: {new Date(r.expiryDate).toLocaleDateString()}</div>
              </div>
              <span className="status-badge status-active">Active</span>
            </div>
          )) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>📅</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active reservations</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/search')}>Browse Books</button>
            </div>
          )}
        </div>
      </div>

      {/* Trending Books */}
      {trending.length > 0 && (
        <div className="mb-4" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <span className="section-title">🔥 Trending Now</span>
            <button className="btn-link" onClick={() => navigate('/popular')}>See all →</button>
          </div>
          <div className="book-grid">
            {trending.slice(0, 4).map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <div className="section-title mb-3" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { icon: '🔍', label: 'Search Books', path: '/search' },
            { icon: '🤖', label: 'AI Assistant', path: '/chat' },
            { icon: '🔥', label: 'Popular Books', path: '/popular' },
            { icon: '✨', label: 'Recommendations', path: '/recommendations' },
            { icon: '📖', label: 'My Borrowings', path: '/borrowings' },
            { icon: '📅', label: 'Reservations', path: '/reservations' },
          ].map(action => (
            <button key={action.path} className="btn btn-secondary" onClick={() => navigate(action.path)}>
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
