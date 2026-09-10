import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/Toast';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Search from './pages/Search';
import BookDetail from './pages/BookDetail';
import Popular from './pages/Popular';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import Borrowings from './pages/Borrowings';
import Reservations from './pages/Reservations';

function AppLayout({ children, fullWidth = false }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/search" element={<Search />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/borrowings" element={<Borrowings />} />
            <Route path="/reservations" element={<Reservations />} />
          </Routes>
        </AppLayout>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
