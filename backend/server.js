require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Watson AI Config
const WATSON_API_KEY = process.env.WATSON_API_KEY;
const WATSON_PROJECT_ID = process.env.WATSON_PROJECT_ID;
const WATSON_MODEL_ID = 'ibm/granite-4-h-small';
const WATSON_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
const WATSON_IAM_URL = 'https://iam.cloud.ibm.com/identity/token';

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too many requests, please slow down.' } });
app.use('/api/', limiter);

// Watson IAM token cache
let watsonToken = null;
let tokenExpiry = 0;

async function getWatsonToken() {
  if (watsonToken && Date.now() < tokenExpiry - 60000) return watsonToken;
  try {
    const resp = await axios.post(WATSON_IAM_URL,
      `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${WATSON_API_KEY}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    watsonToken = resp.data.access_token;
    tokenExpiry = Date.now() + resp.data.expires_in * 1000;
    return watsonToken;
  } catch (e) {
    console.error('Watson token error:', e.message);
    throw new Error('Failed to authenticate with Watson AI');
  }
}

async function callWatsonAI(messages, systemPrompt = '') {
  const token = await getWatsonToken();
  const payload = {
    model_id: WATSON_MODEL_ID,
    project_id: WATSON_PROJECT_ID,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ],
    parameters: {
      max_new_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1
    }
  };
  const resp = await axios.post(WATSON_URL, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return resp.data.choices?.[0]?.message?.content || '';
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library AI Agent running', timestamp: new Date().toISOString() });
});

// ─── BOOKS ───────────────────────────────────────────────────────────────────
app.get('/api/books', (req, res) => {
  const { search, genre, available, sort, limit = 20, offset = 0 } = req.query;
  let result = [...db.books];

  if (search) {
    result = db.ragSearch(search, 20);
  }
  if (genre) {
    result = result.filter(b => b.genre.some(g => g.toLowerCase().includes(genre.toLowerCase())));
  }
  if (available === 'true') {
    result = result.filter(b => b.availableCopies > 0);
  }
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (sort === 'year') result.sort((a, b) => b.year - a.year);
  else if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));

  const total = result.length;
  const paginated = result.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({ books: paginated, total, offset: parseInt(offset), limit: parseInt(limit) });
});

app.get('/api/books/popular', (req, res) => {
  const popular = db.getPopularBooks(8);
  res.json({ books: popular });
});

app.get('/api/books/trending', (req, res) => {
  const trending = db.books.filter(b => b.trending).sort((a, b) => b.rating - a.rating).slice(0, 6);
  res.json({ books: trending });
});

app.get('/api/books/:id', (req, res) => {
  const book = db.books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  // Get waitlist for this book
  const waitlist = db.reservations.filter(r => r.bookId === req.params.id && r.status === 'active');
  res.json({ ...book, waitlistCount: waitlist.length, waitlist });
});

app.get('/api/books/genre/:genre', (req, res) => {
  const books = db.books.filter(b => b.genre.some(g => g.toLowerCase().includes(req.params.genre.toLowerCase())));
  res.json({ books });
});

// ─── RAG SEARCH ──────────────────────────────────────────────────────────────
app.post('/api/search/rag', (req, res) => {
  const { query, filters = {} } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  let results = db.ragSearch(query, 15);

  if (filters.available) results = results.filter(b => b.availableCopies > 0);
  if (filters.genre) results = results.filter(b => b.genre.some(g => g.toLowerCase().includes(filters.genre.toLowerCase())));

  res.json({ results, query, count: results.length, type: 'rag' });
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────
app.get('/api/students/:id', (req, res) => {
  const student = db.students.find(s => s.id === req.params.id || s.studentId === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const borrowedDetails = db.borrowings.filter(br => br.studentId === student.id && br.status === 'borrowed');
  const reservedDetails = db.reservations.filter(r => r.studentId === student.id && r.status === 'active');
  const recommendations = db.getRecommendations(student, 6);

  res.json({ ...student, borrowedDetails, reservedDetails, recommendations });
});

app.get('/api/students/:id/recommendations', (req, res) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const recommendations = db.getRecommendations(student, 8);
  res.json({ recommendations, studentId: req.params.id });
});

// ─── RESERVATIONS ────────────────────────────────────────────────────────────
app.post('/api/reservations', (req, res) => {
  const { bookId, studentId } = req.body;
  if (!bookId || !studentId) return res.status(400).json({ error: 'bookId and studentId required' });

  const book = db.books.find(b => b.id === bookId);
  const student = db.students.find(s => s.id === studentId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const existing = db.reservations.find(r => r.bookId === bookId && r.studentId === studentId && r.status === 'active');
  if (existing) return res.status(409).json({ error: 'You already have a reservation for this book' });

  const alreadyBorrowed = db.borrowings.find(br => br.bookId === bookId && br.studentId === studentId && br.status === 'borrowed');
  if (alreadyBorrowed) return res.status(409).json({ error: 'You already have this book borrowed' });

  const currentWaitlist = db.reservations.filter(r => r.bookId === bookId && r.status === 'active');
  const position = currentWaitlist.length + 1;

  const reservation = {
    id: `r${uuidv4().slice(0, 6)}`,
    bookId, studentId,
    studentName: student.name,
    bookTitle: book.title,
    reservedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active', position
  };

  db.reservations.push(reservation);
  if (!student.reservedBooks.includes(bookId)) student.reservedBooks.push(bookId);
  if (book.availableCopies === 0 && !student.waitlist.includes(bookId)) student.waitlist.push(bookId);
  if (book.availableCopies > 0) { book.availableCopies--; book.reservedCopies++; }

  res.status(201).json({ reservation, message: book.availableCopies > 0 ? 'Book reserved successfully!' : `Added to waitlist at position ${position}` });
});

app.delete('/api/reservations/:id', (req, res) => {
  const idx = db.reservations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });

  const reservation = db.reservations[idx];
  const book = db.books.find(b => b.id === reservation.bookId);
  const student = db.students.find(s => s.id === reservation.studentId);

  db.reservations[idx].status = 'cancelled';
  if (student) {
    student.reservedBooks = student.reservedBooks.filter(id => id !== reservation.bookId);
    student.waitlist = student.waitlist.filter(id => id !== reservation.bookId);
  }
  if (book && book.reservedCopies > 0) { book.reservedCopies--; book.availableCopies++; }

  res.json({ message: 'Reservation cancelled', reservation: db.reservations[idx] });
});

app.get('/api/reservations/student/:studentId', (req, res) => {
  const reservations = db.reservations.filter(r => r.studentId === req.params.studentId && r.status === 'active');
  res.json({ reservations });
});

// ─── BORROWINGS ──────────────────────────────────────────────────────────────
app.post('/api/borrowings', (req, res) => {
  const { bookId, studentId } = req.body;
  const book = db.books.find(b => b.id === bookId);
  const student = db.students.find(s => s.id === studentId);
  if (!book || !student) return res.status(404).json({ error: 'Book or student not found' });
  if (book.availableCopies === 0) return res.status(409).json({ error: 'No copies available' });

  const borrowing = {
    id: `br${uuidv4().slice(0, 6)}`,
    bookId, studentId,
    studentName: student.name,
    bookTitle: book.title,
    borrowDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null, status: 'borrowed', renewCount: 0
  };

  db.borrowings.push(borrowing);
  book.availableCopies--;
  book.borrowedCopies++;
  if (!student.borrowedBooks.includes(bookId)) student.borrowedBooks.push(bookId);

  res.status(201).json({ borrowing, message: 'Book borrowed successfully! Due in 14 days.' });
});

app.put('/api/borrowings/:id/return', (req, res) => {
  const borrowing = db.borrowings.find(br => br.id === req.params.id);
  if (!borrowing) return res.status(404).json({ error: 'Borrowing record not found' });

  borrowing.status = 'returned';
  borrowing.returnDate = new Date().toISOString();

  const book = db.books.find(b => b.id === borrowing.bookId);
  const student = db.students.find(s => s.id === borrowing.studentId);

  if (book) { book.availableCopies++; book.borrowedCopies--; }
  if (student) {
    student.borrowedBooks = student.borrowedBooks.filter(id => id !== borrowing.bookId);
    if (!student.borrowHistory.includes(borrowing.bookId)) student.borrowHistory.push(borrowing.bookId);
    student.totalBorrowed++;
    student.points += 10;
  }

  res.json({ message: 'Book returned successfully! You earned 10 points.', borrowing });
});

app.put('/api/borrowings/:id/renew', (req, res) => {
  const borrowing = db.borrowings.find(br => br.id === req.params.id && br.status === 'borrowed');
  if (!borrowing) return res.status(404).json({ error: 'Borrowing not found' });
  if (borrowing.renewCount >= 2) return res.status(409).json({ error: 'Maximum renewals (2) reached' });

  borrowing.dueDate = new Date(new Date(borrowing.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  borrowing.renewCount++;

  res.json({ message: 'Renewed for 14 more days!', borrowing });
});

// ─── STATS ───────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const totalBooks = db.books.length;
  const totalCopies = db.books.reduce((s, b) => s + b.totalCopies, 0);
  const availableCopies = db.books.reduce((s, b) => s + b.availableCopies, 0);
  const totalStudents = db.students.length;
  const activeBorrowings = db.borrowings.filter(br => br.status === 'borrowed').length;
  const activeReservations = db.reservations.filter(r => r.status === 'active').length;
  const genreCounts = {};
  db.books.forEach(b => b.genre.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));

  res.json({
    totalBooks, totalCopies, availableCopies, totalStudents,
    activeBorrowings, activeReservations,
    genreDistribution: genreCounts,
    topRated: db.books.sort((a, b) => b.rating - a.rating).slice(0, 3).map(b => ({ id: b.id, title: b.title, rating: b.rating }))
  });
});

// ─── AI CHAT ─────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, history = [], studentId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // RAG: search relevant books for context
  const ragResults = db.ragSearch(message, 5);
  const student = studentId ? db.students.find(s => s.id === studentId) : null;

  const bookContext = ragResults.length > 0
    ? `\n\nRelevant books from our library:\n${ragResults.map(b =>
        `- "${b.title}" by ${b.author} (${b.genre.join(', ')}) - Rating: ${b.rating}/5 - ${b.availableCopies > 0 ? `${b.availableCopies} copies available` : 'Currently unavailable'} - Location: ${b.location}`
      ).join('\n')}`
    : '';

  const studentContext = student
    ? `\n\nStudent: ${student.name} (${student.department}, Year ${student.year}) - Interests: ${student.interests.join(', ')} - Currently borrowed: ${student.borrowedBooks.length} books`
    : '';

  const systemPrompt = `You are an intelligent Library AI Assistant for a university library. You help students find books, get recommendations, check availability, manage reservations, and answer questions about the library.

You have access to a database of 20 computer science and technology books. Be helpful, concise, and friendly. When recommending books, mention specific titles from the library database. Format responses clearly.

Library hours: Mon-Fri 8am-10pm, Sat-Sun 10am-8pm.
Fine for overdue: $0.50/day. Max loan period: 14 days. Max renewals: 2 times.
${bookContext}${studentContext}

Respond in a helpful, conversational way. Keep responses under 200 words unless detailed explanation is needed.`;

  const messages = [
    ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  try {
    const aiResponse = await callWatsonAI(messages, systemPrompt);
    res.json({
      response: aiResponse,
      ragContext: ragResults.slice(0, 3).map(b => ({ id: b.id, title: b.title, author: b.author, relevanceScore: b.relevanceScore })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Watson AI error:', error.message);
    // Fallback response
    const fallback = generateFallbackResponse(message, ragResults, student);
    res.json({
      response: fallback,
      ragContext: ragResults.slice(0, 3).map(b => ({ id: b.id, title: b.title, author: b.author })),
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

function generateFallbackResponse(message, ragResults, student) {
  const msg = message.toLowerCase();
  if (msg.includes('recommend') || msg.includes('suggest')) {
    if (ragResults.length > 0) {
      return `Based on your query, I recommend:\n${ragResults.slice(0, 3).map(b => `📚 **${b.title}** by ${b.author} — Rating: ${b.rating}/5 — ${b.availableCopies > 0 ? `✅ Available (${b.availableCopies} copies)` : '❌ Unavailable'}`).join('\n')}`;
    }
    return "I'd be happy to recommend books! Could you tell me what subject or topic you're interested in?";
  }
  if (msg.includes('available') || msg.includes('borrow')) {
    const available = db.books.filter(b => b.availableCopies > 0).slice(0, 3);
    return `Currently available books include:\n${available.map(b => `📗 **${b.title}** — ${b.availableCopies} copies available`).join('\n')}`;
  }
  if (msg.includes('hour') || msg.includes('open')) {
    return "📅 **Library Hours:**\n• Mon–Fri: 8:00 AM – 10:00 PM\n• Sat–Sun: 10:00 AM – 8:00 PM\n\nWe're here to help!";
  }
  if (ragResults.length > 0) {
    return `I found some relevant books for you:\n${ragResults.slice(0, 3).map(b => `📚 **${b.title}** by ${b.author} — ${b.availableCopies > 0 ? `${b.availableCopies} available` : 'On waitlist'}`).join('\n')}`;
  }
  return "I'm here to help you find books, check availability, and manage your borrowings. What are you looking for today?";
}

// ─── SERVER ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Library AI Agent Backend running on http://localhost:${PORT}`);
  console.log(`📚 ${db.books.length} books | 👥 ${db.students.length} students in database`);
  console.log(`🤖 Watson AI: ${WATSON_MODEL_ID}\n`);
});

module.exports = app;
