import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const DEMO_STUDENT_ID = 's001';

export function AppProvider({ children }) {
  const [currentStudent] = useState({ id: DEMO_STUDENT_ID, name: 'Alice Johnson', avatar: 'AJ', department: 'Computer Science', year: 3 });
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ currentStudent, toasts, addToast, removeToast, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
