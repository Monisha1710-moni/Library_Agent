import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, createReservation, borrowBook } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useApp();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBook(id);
        setBook(res.data);
      } catch (e) {
        addToast('Book not found', 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, addToast]);

  const handleReserve = async () => {
    setActionLoading(true);
    try {
      const res = await createReservation(book.id, DEMO_STUDENT_ID);
      addToast(res.data.message || 'Reserved successfully!', 'success');
      const updated = await getBook(id);
      setBook(updated.data);
    } catch (e) {
      addToast(e.response?.data?.error || 'Could not reserve this book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrow = async () => {
    setActionLoading(true);
    try {
      const res = await borrowBook(book.id, DEMO_STUDENT_ID);
      addToast(res.data.message || 'Book borrowed!', 'success');
      const updated = await getBook(id);
      setBook(updated.data);
    } catch (e) {
      addToast(e.response?.data?.error || 'Could not borrow this book', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="page-content">
      <div className="loading-overlay"><div className="spinner" style={{ width: 36, height: 36 }} /><span>Loading book…</span></div>
    </div>
  );

  if (!book) return null;

  const availabilityPct = (book.availableCopies / book.totalCopies) * 100;

  return (
    <div className="page-content">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>

      <div className="book-detail-header">
        <div className="book-detail-cover" style={{ background: book.coverColor }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📖</div>
          <div>{book.title}</div>
        </div>

        <div className="book-detail-info">
          <div className="book-detail-title">{book.title}</div>
          <div className="book-detail-author">by {book.author}</div>

          <div className="book-meta-row">
            <div className="book-meta-item">⭐ <strong>{book.rating}</strong>/5 ({book.reviewCount?.toLocaleString()} reviews)</div>
            <div className="book-meta-item">📅 <strong>{book.year}</strong></div>
            {book.edition && <div className="book-meta-item">📋 <strong>{book.edition} edition</strong></div>}
            <div className="book-meta-item">📄 <strong>{book.pageCount}</strong> pages</div>
            <div className="book-meta-item">🏢 <strong>{book.publisher}</strong></div>
          </div>

          <div className="book-meta-row">
            <div className="book-meta-item">📍 <strong>{book.location}</strong></div>
            <div className="book-meta-item">🔢 ISBN: <strong>{book.isbn}</strong></div>
          </div>

          {/* Availability */}
          <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 20, maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Availability</span>
              <span style={{ fontSize: 13, color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {book.availableCopies}/{book.totalCopies} copies
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${availabilityPct}%`, background: availabilityPct > 50 ? 'var(--success)' : availabilityPct > 20 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>✅ {book.availableCopies} available</span>
              <span>📖 {book.borrowedCopies} borrowed</span>
              <span>📅 {book.reservedCopies} reserved</span>
            </div>
            {book.waitlistCount > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--warning)' }}>
                ⏳ {book.waitlistCount} student{book.waitlistCount > 1 ? 's' : ''} on waitlist
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {book.availableCopies > 0 ? (
              <>
                <button className="btn btn-success" onClick={handleBorrow} disabled={actionLoading}>
                  {actionLoading ? <span className="spinner" /> : '📖 Borrow Now'}
                </button>
                <button className="btn btn-secondary" onClick={handleReserve} disabled={actionLoading}>
                  📅 Reserve
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleReserve} disabled={actionLoading}>
                {actionLoading ? <span className="spinner" /> : '⏳ Join Waitlist'}
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
              🤖 Ask AI About This
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['Description', 'Details', 'Genre & Tags'].map((tab, i) => (
          <button key={tab} className="filter-btn active" style={{ borderRadius: 8 }}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>📝 Description</div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 14 }}>{book.description}</p>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>🏷 Genre</div>
            <div className="tag-list">
              {book.genre?.map(g => <span key={g} className="tag">{g}</span>)}
            </div>
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>🔖 Tags</div>
            <div className="tag-list">
              {book.tags?.map(t => (
                <span key={t} className="tag" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--secondary)', cursor: 'pointer' }}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
