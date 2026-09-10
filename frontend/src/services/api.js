import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Books ──────────────────────────────────────────────────────────────────
export const getBooks = (params = {}) => API.get('/books', { params });
export const getBook = (id) => API.get(`/books/${id}`);
export const getPopularBooks = () => API.get('/books/popular');
export const getTrendingBooks = () => API.get('/books/trending');
export const getBooksByGenre = (genre) => API.get(`/books/genre/${genre}`);

// ── RAG Search ─────────────────────────────────────────────────────────────
export const ragSearch = (query, filters = {}) => API.post('/search/rag', { query, filters });

// ── Students ───────────────────────────────────────────────────────────────
export const getStudent = (id) => API.get(`/students/${id}`);
export const getRecommendations = (studentId) => API.get(`/students/${studentId}/recommendations`);

// ── Reservations ───────────────────────────────────────────────────────────
export const createReservation = (bookId, studentId) => API.post('/reservations', { bookId, studentId });
export const cancelReservation = (id) => API.delete(`/reservations/${id}`);
export const getStudentReservations = (studentId) => API.get(`/reservations/student/${studentId}`);

// ── Borrowings ─────────────────────────────────────────────────────────────
export const borrowBook = (bookId, studentId) => API.post('/borrowings', { bookId, studentId });
export const returnBook = (id) => API.put(`/borrowings/${id}/return`);
export const renewBook = (id) => API.put(`/borrowings/${id}/renew`);

// ── Stats ──────────────────────────────────────────────────────────────────
export const getStats = () => API.get('/stats');

// ── Chat ───────────────────────────────────────────────────────────────────
export const sendChatMessage = (message, history, studentId) =>
  API.post('/chat', { message, history, studentId });

// ── Health ─────────────────────────────────────────────────────────────────
export const checkHealth = () => API.get('/health');

export default API;
