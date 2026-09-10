# Library AI Agent

A full-stack AI-powered university library management system with IBM Granite AI integration and RAG-based search.

## Architecture

```
Library_AI_Agent/
├── backend/          ← Express.js API server
│   ├── server.js     ← Main server + all API routes
│   └── database.js   ← In-memory DB + RAG search engine
└── frontend/         ← React.js SPA
    └── src/
        ├── pages/    ← Dashboard, Chat, Search, BookDetail, Profile…
        ├── components/ ← Sidebar, Topbar, BookCard, Toast
        ├── services/ ← Axios API client
        └── context/  ← App state (student, toasts)
```

## Features

- 🤖 **AI Chat Assistant** — IBM Granite 4H-Small via watsonx.ai with RAG context
- 🔬 **RAG Search** — Semantic book search using keyword relevance scoring
- 📚 **Book Database** — 20 CS/tech books with full metadata
- 👤 **Student Profiles** — Borrowings, reservations, points, achievements
- 📅 **Reservations & Waitlist** — Reserve books, track queue position
- 📖 **Borrow Management** — Borrow, return, renew with due date tracking
- ✨ **Personalized Recommendations** — Interest-based AI recommendations
- 🔥 **Popular & Trending** — Curated lists with ratings

## Running the App

### Prerequisites
- Node.js 18+

### Start Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend (separate terminal)
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/books | List/search books |
| GET | /api/books/popular | Popular books |
| GET | /api/books/trending | Trending books |
| GET | /api/books/:id | Book details + waitlist |
| POST | /api/search/rag | RAG semantic search |
| GET | /api/students/:id | Student profile |
| GET | /api/students/:id/recommendations | Personalized recs |
| POST | /api/reservations | Reserve a book |
| DELETE | /api/reservations/:id | Cancel reservation |
| POST | /api/borrowings | Borrow a book |
| PUT | /api/borrowings/:id/return | Return a book |
| PUT | /api/borrowings/:id/renew | Renew a book |
| GET | /api/stats | Library statistics |
| POST | /api/chat | AI chat (Watson) |

## AI Integration

- **Model**: IBM Granite 4H-Small (`ibm/granite-4-h-small`)
- **Platform**: watsonx.ai (us-south)
- **RAG**: Keyword-weighted relevance scoring against 20 books
- **Fallback**: Smart keyword-based responses when AI is unavailable
