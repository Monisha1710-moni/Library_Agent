import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, returnBook, renewBook } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';

export default function Borrowings() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { addToast } = useApp();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getStudent(DEMO_STUDENT_ID);
      setStudent(res.data);
    } catch {
      addToast('Failed to load borrowings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (borrowingId) => {
    setActionId(borrowingId);
    try {
      const res = await returnBook(borrowingId);
      addToast(res.data.message || 'Book returned!', 'success');
      load();
    } catch (e) {
      addToast(e.response?.data?.error || 'Could not return book', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleRenew = async (borrowingId) => {
    setActionId(borrowingId);
    try {
      const res = await renewBook(borrowingId);
      addToast(res.data.message || 'Renewed!', 'success');
      load();
    } catch (e) {
      addToast(e.response?.data?.error || 'Could not renew', 'error');
    } finally {
      setActionId(null);
    }
  };

  const getDaysLeft = (dueDate) => {
    return Math.ceil((new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="page-content"><div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div></div>
  );

  const borrowings = student?.borrowedDetails || [];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">📖 My Borrowings</div>
        <div className="page-subtitle">Manage your currently borrowed books</div>
      </div>

      {/* Stats row */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '📚', val: borrowings.length, lbl: 'Currently Borrowed', color: 'blue' },
          { icon: '✅', val: student?.totalBorrowed || 0, lbl: 'Total Borrowed', color: 'green' },
          { icon: '⭐', val: student?.points || 0, lbl: 'Library Points', color: 'amber' },
          { icon: '⚠️', val: borrowings.filter(b => getDaysLeft(b.dueDate) <= 3).length, lbl: 'Due Soon', color: 'red' },
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

      {borrowings.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No books borrowed</h3>
            <p>Browse our collection and borrow your first book!</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Books</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Renewals</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map(b => {
                  const daysLeft = getDaysLeft(b.dueDate);
                  const isOverdue = daysLeft < 0;
                  const isDueSoon = daysLeft <= 3 && daysLeft >= 0;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-light)' }}
                          onClick={() => navigate(`/book/${b.bookId}`)}
                        >{b.bookTitle}</div>
                      </td>
                      <td className="text-muted">{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ color: isOverdue ? 'var(--danger)' : isDueSoon ? 'var(--warning)' : 'var(--text)' }}>
                          {new Date(b.dueDate).toLocaleDateString()}
                          <div style={{ fontSize: 11, marginTop: 2 }}>
                            {isOverdue ? `⚠️ ${Math.abs(daysLeft)}d overdue` : isDueSoon ? `⏰ ${daysLeft}d left` : `${daysLeft}d remaining`}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={b.renewCount >= 2 ? 'text-danger' : 'text-muted'}>{b.renewCount}/2</span>
                      </td>
                      <td>
                        <span className={`status-badge ${isOverdue ? 'status-overdue' : 'status-borrowed'}`}>
                          {isOverdue ? 'Overdue' : 'Borrowed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReturn(b.id)}
                            disabled={actionId === b.id}
                          >
                            {actionId === b.id ? <span className="spinner" /> : '↩ Return'}
                          </button>
                          {b.renewCount < 2 && !isOverdue && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleRenew(b.id)}
                              disabled={actionId === b.id}
                            >
                              🔄 Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrow History */}
      {student?.borrowHistory?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>📋 Borrow History ({student.borrowHistory.length} books)</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            You have previously borrowed {student.borrowHistory.length} books from our library.
            Keep reading to earn more library points! 📚
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/recommendations')}>
              ✨ Get Recommendations
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/search')}>
              🔍 Search Books
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
