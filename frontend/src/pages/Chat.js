import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage } from '../services/api';
import { useApp, DEMO_STUDENT_ID } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  "Recommend books on machine learning",
  "Find books on algorithms",
  "What JavaScript books are available?",
  "Show me popular books",
  "What are the library hours?",
  "I'm interested in data science books",
  "Find beginner programming books",
  "Books on software architecture",
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hello! I'm your **Library AI Assistant** powered by IBM Granite.

I can help you:
• 🔍 **Find and search** for books using natural language
• 📚 **Get personalized recommendations** based on your interests
• ✅ **Check availability** and reserve books
• 📅 **Manage your borrowings** and reservations
• 💡 **Answer library questions** — hours, policies, and more

What would you like to explore today?`,
  timestamp: new Date().toISOString(),
  ragContext: null
};

function formatMessage(text) {
  // Convert markdown-like formatting to HTML
  return text
    .split('\n')
    .map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/`(.*?)`/g, '<code style="background:rgba(79,70,229,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>');
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return `<div style="padding-left:8px;margin:2px 0">${line}</div>`;
      }
      return line ? `<p style="margin:4px 0">${line}</p>` : '<div style="margin:4px 0"></div>';
    })
    .join('');
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToast } = useApp();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const history = messages.filter(m => m.id !== 'welcome').slice(-8).map(m => ({
        role: m.role, content: m.content
      }));

      const res = await sendChatMessage(msg, history, DEMO_STUDENT_ID);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        timestamp: res.data.timestamp,
        ragContext: res.data.ragContext,
        fallback: res.data.fallback
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check that the backend server is running on port 5000.\n\n💡 You can still browse books in the **Search** and **Popular** sections.",
        timestamp: new Date().toISOString(),
        ragContext: null,
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
      addToast('AI service temporarily unavailable', 'warning');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, addToast]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowSuggestions(true);
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: 'var(--gradient-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Library AI Assistant</div>
          <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
            IBM Granite · RAG-powered
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={clearChat}>🗑 Clear Chat</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/search')}>🔍 Search Books</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`}>
            <div className={`chat-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
              {msg.role === 'assistant' ? '🤖' : 'AJ'}
            </div>
            <div>
              <div className={`chat-content ${msg.error ? 'status-overdue' : ''}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.ragContext && msg.ragContext.length > 0 && (
                <div className="rag-context">
                  <div className="rag-label">🔬 RAG Context Used:</div>
                  {msg.ragContext.map(b => (
                    <div key={b.id} style={{ fontSize: 11.5, cursor: 'pointer', color: 'var(--secondary)' }} onClick={() => navigate(`/book/${b.id}`)}>
                      → {b.title} by {b.author} {b.relevanceScore ? `(score: ${b.relevanceScore})` : ''}
                    </div>
                  ))}
                </div>
              )}
              {msg.fallback && (
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>⚡ Offline mode — AI unavailable, using smart fallback</div>
              )}
              <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar ai">🤖</div>
            <div className="chat-content">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        {showSuggestions && (
          <div className="chat-suggestions">
            {SUGGESTIONS.slice(0, 6).map(s => (
              <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask me anything about the library, books, or recommendations…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ lineHeight: 1.5 }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button className="chat-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '➤'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Powered by IBM Granite AI
        </div>
      </div>
    </div>
  );
}
