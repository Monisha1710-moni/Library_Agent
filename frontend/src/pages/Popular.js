import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getPopularBooks, getTrendingBooks } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Popular() {
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');
  const { addToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [popRes, trendRes] = await Promise.all([getPopularBooks(), getTrendingBooks()]);
        setPopular(popRes.data.books || []);
        setTrending(trendRes.data.books || []);
      } catch {
        addToast('Failed to load books', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const books = activeTab === 'popular' ? popular : trending;

  if (loading) return (
    <div className="page-content"><div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div></div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">🔥 Popular Books</div>
        <div className="page-subtitle">Discover what students are reading right now</div>
      </div>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(14,165,233,0.2) 100%)',
        border: '1px solid rgba(79,70,229,0.3)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>📚 This Week's Highlights</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {popular.length} popular titles · {trending.length} trending books · Updated weekly
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>
          🔍 Browse All Books
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
        {[
          { id: 'popular', label: '⭐ Most Popular', count: popular.length },
          { id: 'trending', label: '🔥 Trending Now', count: trending.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.2s'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {books.length > 0 ? (
        <>
          {/* Top 3 featured */}
          {activeTab === 'popular' && (
            <div style={{ marginBottom: 32 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>🏆 Top Rated</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {books.slice(0, 3).map((book, i) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 16,
                      display: 'flex',
                      gap: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 60, height: 78, borderRadius: 8, background: book.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📖</div>
                      <div style={{
                        position: 'absolute', top: -6, left: -6,
                        width: 22, height: 22,
                        background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7c2f',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: 'white'
                      }}>#{i + 1}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{book.author.split(',')[0]}</div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                        <span style={{ color: 'var(--accent)' }}>⭐ {book.rating}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{book.reviewCount?.toLocaleString()} reviews</span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                          {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-title" style={{ marginBottom: 16 }}>
            {activeTab === 'popular' ? '📚 All Popular' : '🔥 Trending Books'}
          </div>
          <div className="book-grid">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No books found</h3>
        </div>
      )}
    </div>
  );
}
