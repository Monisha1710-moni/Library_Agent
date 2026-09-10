import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, cancelReservation } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';

export default function Reservations() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const { addToast } = useApp();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getStudent(DEMO_STUDENT_ID);
      setStudent(res.data);
    } catch {
      addToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (reservationId) => {
    setCancelId(reservationId);
    try {
      await cancelReservation(reservationId);
      addToast('Reservation cancelled', 'info');
      load();
    } catch (e) {
      addToast(e.response?.data?.error || 'Could not cancel reservation', 'error');
    } finally {
      setCancelId(null);
    }
  };

  const reservations = student?.reservedDetails || [];

  if (loading) return (
    <div className="page-content"><div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div></div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">📅 Reservations & Waitlist</div>
        <div className="page-subtitle">Track your reserved books and waitlist positions</div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '📅', val: reservations.length, lbl: 'Active Reservations', color: 'sky' },
          { icon: '⏳', val: student?.waitlist?.length || 0, lbl: 'On Waitlist', color: 'amber' },
          { icon: '📚', val: student?.borrowedBooks?.length || 0, lbl: 'Borrowed', color: 'blue' },
          { icon: '⭐', val: student?.points || 0, lbl: 'Points', color: 'purple' },
        ].map(item => (
          <div className="stat-card" key={item.lbl}>
            <div className={`stat-icon ${item.color}`}>{item.icon}</div>
            <div>
              <div className="stat-value">{item.val}</div>
              <div className="stat-label">{item.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {reservations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No active reservations</h3>
            <p>Reserve books that are currently borrowed or unavailable to secure your spot.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>
              Browse Books
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Active Reservations</span>
            <span className="text-muted text-sm">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Reserved On</th>
                  <th>Expires</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => {
                  const daysToExpiry = Math.ceil((new Date(r.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-light)' }} onClick={() => navigate(`/book/${r.bookId}`)}>
                          {r.bookTitle}
                        </div>
                      </td>
                      <td className="text-muted">{new Date(r.reservedDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ color: daysToExpiry <= 2 ? 'var(--warning)' : 'var(--text)' }}>
                          {new Date(r.expiryDate).toLocaleDateString()}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{daysToExpiry}d remaining</div>
                        </span>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(79,70,229,0.15)', color: 'var(--primary-light)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          #{r.position || 1}
                        </span>
                      </td>
                      <td><span className="status-badge status-active">Active</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelId === r.id}
                        >
                          {cancelId === r.id ? <span className="spinner" /> : '✕ Cancel'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reservation policy */}
      <div className="card" style={{ marginTop: 24, background: 'rgba(14,165,233,0.05)', borderColor: 'rgba(14,165,233,0.2)' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>📋 Reservation Policy</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { icon: '⏰', title: 'Reservation expires in 7 days', desc: 'after the book becomes available' },
            { icon: '📌', title: 'Max 3 active reservations', desc: 'per student at any time' },
            { icon: '🔔', title: 'Email notification', desc: 'when your book is ready for pickup' },
            { icon: '🚀', title: 'Priority order maintained', desc: 'first reserved = first served' },
          ].map(p => (
            <div key={p.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
