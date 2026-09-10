import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, getRecommendations } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';
import BookCard from '../components/BookCard';

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { addToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [studentRes, recsRes] = await Promise.all([
          getStudent(DEMO_STUDENT_ID),
          getRecommendations(DEMO_STUDENT_ID)
        ]);
        setStudent(studentRes.data);
        setRecs(recsRes.data.recommendations?.slice(0, 4) || []);
      } catch {
        addToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  if (loading) return (
    <div className="page-content"><div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div></div>
  );

  if (!student) return null;

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'borrowed', label: `📖 Borrowed (${student.borrowedBooks?.length || 0})` },
    { id: 'history', label: `📋 History (${student.borrowHistory?.length || 0})` },
    { id: 'recommendations', label: '✨ For You' },
  ];

  const membershipColors = { Premium: '#f59e0b', Standard: '#6366f1', Basic: '#6b7280' };

  return (
    <div className="page-content">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="avatar xl">{student.avatar}</div>
        <div className="profile-hero-info">
          <div className="profile-name">{student.name}</div>
          <div className="profile-dept">{student.department} · Year {student.year}</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📧 {student.email}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🎓 {student.studentId}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📅 Since {new Date(student.joinDate).getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="membership-badge">
              ⭐ {student.membershipType} Member
            </span>
            <span style={{
              background: 'rgba(79,70,229,0.12)', color: 'var(--primary-light)',
              padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600
            }}>
              GPA: {student.gpa}
            </span>
            <span style={{
              background: 'rgba(245,158,11,0.12)', color: 'var(--accent)',
              padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600
            }}>
              {student.points} pts
            </span>
          </div>
        </div>

        <div className="profile-stats-row">
          {[
            { val: student.totalBorrowed || 0, lbl: 'Total Borrowed' },
            { val: student.borrowedBooks?.length || 0, lbl: 'Active' },
            { val: student.reservedBooks?.length || 0, lbl: 'Reserved' },
            { val: student.points, lbl: 'Points' },
          ].map(stat => (
            <div className="profile-stat" key={stat.lbl}>
              <div className="val">{stat.val}</div>
              <div className="lbl">{stat.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>🎯 Your Interests</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Used for personalized recommendations</span>
        </div>
        <div className="tag-list">
          {student.interests?.map(i => (
            <span key={i} className="tag" style={{ cursor: 'pointer' }} onClick={() => navigate(`/search?q=${encodeURIComponent(i)}`)}>
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: 'none', border: 'none',
            padding: '10px 18px',
            fontSize: 13.5, fontWeight: 600,
            color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.id ? '2px solid var(--primary-light)' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1, transition: 'all 0.2s'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-2" style={{ gap: 20, marginBottom: 20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>📊 Reading Stats</div>
              {[
                { label: 'Books Borrowed This Month', value: student.borrowedBooks?.length || 0, total: 5, color: 'var(--primary-light)' },
                { label: 'Overdue Books', value: student.overdueCount || 0, total: student.borrowedBooks?.length || 5, color: 'var(--danger)' },
                { label: 'Reading Goal Progress', value: student.totalBorrowed || 0, total: 20, color: 'var(--success)' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}/{item.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((item.value / item.total) * 100, 100)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>🏆 Achievements</div>
              {[
                { icon: '📚', label: 'Bookworm', desc: 'Borrowed 5+ books', unlocked: (student.totalBorrowed || 0) >= 5 },
                { icon: '⭐', label: 'Point Collector', desc: '100+ library points', unlocked: (student.points || 0) >= 100 },
                { icon: '🔁', label: 'Regular Reader', desc: 'Active member 1+ year', unlocked: true },
                { icon: '🎯', label: 'Explorer', desc: 'Borrowed from 3+ genres', unlocked: true },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(45,53,85,0.5)', opacity: a.unlocked ? 1 : 0.4 }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: a.unlocked ? 'var(--success)' : 'var(--text-dim)' }}>
                    {a.unlocked ? '✅ Unlocked' : '🔒 Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>⚡ Quick Actions</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {[
                { icon: '🔍', label: 'Find Books', path: '/search' },
                { icon: '🤖', label: 'AI Chat', path: '/chat' },
                { icon: '📖', label: 'My Borrowings', path: '/borrowings' },
                { icon: '📅', label: 'Reservations', path: '/reservations' },
                { icon: '✨', label: 'Recommendations', path: '/recommendations' },
              ].map(a => (
                <button key={a.path} className="btn btn-secondary" onClick={() => navigate(a.path)}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'borrowed' && (
        <div className="card">
          {student.borrowedDetails?.length > 0 ? (
            <div className="book-grid">
              {student.borrowedDetails.map(b => (
                <div key={b.id} onClick={() => navigate(`/book/${b.bookId}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.bookTitle}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Due: {new Date(b.dueDate).toLocaleDateString()}</div>
                    <span className="status-badge status-borrowed">Borrowed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No borrowed books</h3><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/search')}>Browse Books</button></div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            You have borrowed {student.borrowHistory?.length || 0} books in total. Keep reading to earn more library points!
          </div>
          {student.borrowHistory?.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {student.borrowHistory.map(bookId => (
                <button key={bookId} className="btn btn-secondary btn-sm" onClick={() => navigate(`/book/${bookId}`)}>
                  📖 {bookId}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <>
          {recs.length > 0 ? (
            <div className="book-grid">
              {recs.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="card"><div className="empty-state"><div className="empty-icon">✨</div><h3>Loading…</h3></div></div>
          )}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/recommendations')}>See All Recommendations</button>
          </div>
        </>
      )}
    </div>
  );
}
