import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getBooks, ragSearch } from '../services/api';
import { useApp } from '../context/AppContext';

const GENRES = ['All', 'Computer Science', 'Algorithms', 'Machine Learning', 'Web Development', 'Software Engineering', 'Database', 'Networking', 'Operating Systems', 'Distributed Systems', 'Data Science', 'DevOps'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'year', label: 'Newest First' },
  { value: 'title', label: 'A–Z' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('');
  const [available, setAvailable] = useState(false);
  const [searchType, setSearchType] = useState('');
  const { addToast } = useApp();
  const navigate = useNavigate();

  const doSearch = useCallback(async (q, g, s, av) => {
    setLoading(true);
    try {
      if (q && q.trim()) {
        const filters = {};
        if (g && g !== 'All') filters.genre = g;
        if (av) filters.available = true;
        const res = await ragSearch(q, filters);
        let results = res.data.results || [];
        if (s === 'rating') results = results.sort((a, b) => b.rating - a.rating);
        else if (s === 'year') results = results.sort((a, b) => b.year - a.year);
        else if (s === 'title') results = results.sort((a, b) => a.title.localeCompare(b.title));
        setBooks(results);
        setTotal(results.length);
        setSearchType('rag');
      } else {
        const params = {};
        if (g && g !== 'All') params.genre = g;
        if (s) params.sort = s;
        if (av) params.available = 'true';
        params.limit = 20;
        const res = await getBooks(params);
        setBooks(res.data.books || []);
        setTotal(res.data.total || 0);
        setSearchType('browse');
      }
    } catch (e) {
      addToast('Search failed. Please try again.', 'error');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    doSearch(q, genre, sort, available);
  }, [searchParams]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchParams(query ? { q: query } : {});
      doSearch(query, genre, sort, available);
    }
  };

  const handleFilterChange = (newGenre, newSort, newAvail) => {
    const g = newGenre ?? genre;
    const s = newSort ?? sort;
    const av = newAvail ?? available;
    setGenre(g); setSort(s); setAvailable(av);
    doSearch(query, g, s, av);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">🔍 Search Library</div>
        <div className="page-subtitle">RAG-powered semantic search across {total > 0 ? total : '20'} books</div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-ico">🔍</span>
          <input
            type="text"
            className="search-input-lg"
            placeholder="Search by title, author, topic, keyword… (e.g. 'machine learning Python')"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setSearchParams(query ? { q: query } : {}); doSearch(query, genre, sort, available); }}>
          Search
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GENRES.map(g => (
            <button key={g} className={`filter-btn ${genre === g ? 'active' : ''}`} onClick={() => handleFilterChange(g, null, null)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {SORT_OPTIONS.map(opt => (
          <button key={opt.value} className={`filter-btn ${sort === opt.value ? 'active' : ''}`} onClick={() => handleFilterChange(null, opt.value, null)}>
            {opt.label}
          </button>
        ))}
        <button
          className={`filter-btn ${available ? 'active' : ''}`}
          onClick={() => handleFilterChange(null, null, !available)}
        >
          ✅ Available Only
        </button>

        {(query || genre !== 'All' || sort || available) && (
          <button className="btn btn-secondary btn-sm" onClick={() => {
            setQuery(''); setGenre('All'); setSort(''); setAvailable(false);
            setSearchParams({});
            doSearch('', 'All', '', false);
          }}>✕ Clear Filters</button>
        )}
      </div>

      {/* Results header */}
      {!loading && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {total > 0 ? `${total} book${total !== 1 ? 's' : ''} found` : 'No books found'}
            {query && <span style={{ color: 'var(--secondary)' }}> for "{query}"</span>}
          </span>
          {searchType === 'rag' && (
            <span style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: 'var(--secondary)', fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>🔬 RAG Search</span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Searching with RAG…</span></div>
      ) : books.length > 0 ? (
        <div className="book-grid">
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No books found</h3>
          <p>Try a different search term or clear filters</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setQuery(''); setGenre('All'); setSearchParams({}); doSearch('', 'All', '', false); }}>
            Show All Books
          </button>
        </div>
      )}
    </div>
  );
}
