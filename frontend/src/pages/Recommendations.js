import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getStudent, getRecommendations } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';

export default function Recommendations() {
  const [student, setStudent] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setRecs(recsRes.data.recommendations || []);
      } catch {
        addToast('Failed to load recommendations', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  if (loading) return (
    <div className="page-content"><div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div></div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">✨ Personalized Recommendations</div>
        <div className="page-subtitle">AI-curated books based on your interests and reading history</div>
      </div>

      {/* Interest Profile */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(14,165,233,0.1) 100%)', border: '1px solid rgba(79,70,229,0.25)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, background: 'var(--gradient-1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Your Interest Profile</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
              Based on your interests: {student?.interests?.join(', ')}
            </div>
            <div className="tag-list">
              {student?.interests?.map(i => (
                <span key={i} className="tag" style={{ cursor: 'pointer' }} onClick={() => navigate(`/search?q=${encodeURIComponent(i)}`)}>
                  {i}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{recs.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>For You</div>
          </div>
        </div>
      </div>

      {/* How recommendations work */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>🔬 How it works:</div>
          {[
            { icon: '📖', label: 'Borrow History', desc: `${student?.borrowHistory?.length || 0} past reads` },
            { icon: '🎯', label: 'Your Interests', desc: `${student?.interests?.length || 0} topics` },
            { icon: '🔥', label: 'Popularity Score', desc: 'Community ratings' },
            { icon: '🤖', label: 'RAG Matching', desc: 'Semantic similarity' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations grid */}
      {recs.length > 0 ? (
        <>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">📚 Recommended For You</span>
            <span className="text-muted text-sm">{recs.length} books</span>
          </div>
          <div className="book-grid">
            {recs.map(book => (
              <div key={book.id}>
                <BookCard book={book} />
                {book.relevanceScore !== undefined && (
                  <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                    Match score: {book.relevanceScore}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h3>No recommendations yet</h3>
          <p>Borrow some books to help us learn your preferences!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Books</button>
        </div>
      )}

      <div className="card" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>💡 Explore More</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {student?.interests?.map(interest => (
            <button
              key={interest}
              className="btn btn-secondary"
              onClick={() => navigate(`/search?q=${encodeURIComponent(interest)}`)}
            >
              🔍 {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
