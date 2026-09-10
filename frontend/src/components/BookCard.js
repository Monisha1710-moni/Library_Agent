import React from 'react';
import { useNavigate } from 'react-router-dom';

function getAvailClass(book) {
  if (book.availableCopies === 0) return 'unavailable';
  if (book.availableCopies <= 2) return 'limited';
  return 'available';
}

function getAvailText(book) {
  if (book.availableCopies === 0) return 'Unavailable';
  if (book.availableCopies <= 2) return `${book.availableCopies} left`;
  return `${book.availableCopies} available`;
}

export default function BookCard({ book, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(book); else navigate(`/book/${book.id}`); };

  return (
    <div className="book-card" onClick={handleClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>
      <div className="book-cover" style={{ background: book.coverColor }}>
        <span className="cover-icon">📖</span>
        <span style={{ fontSize: 12, lineHeight: 1.3 }}>{book.title}</span>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author.split(',')[0]}{book.author.includes(',') ? ' et al.' : ''}</div>
        <div className="book-meta">
          <span className="book-rating">⭐ {book.rating}</span>
          <span className={`availability-badge ${getAvailClass(book)}`}>{getAvailText(book)}</span>
        </div>
        {book.trending && (
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 20 }}>🔥 Trending</span>
          </div>
        )}
      </div>
    </div>
  );
}
