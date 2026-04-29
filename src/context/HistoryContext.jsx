import React, { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('mova-conversations-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mova-conversations-history', JSON.stringify(history));
  }, [history]);

  const saveConversation = (text) => {
    if (!text.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      date: new Date().toISOString(),
      title: text.trim().substring(0, 20) + (text.length > 20 ? '...' : '')
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const deleteConversation = (id) => {
    setHistory((prev) => prev.filter(item => item.id !== id));
  };

  const renameConversation = (id, newTitle) => {
    if (!newTitle.trim()) return;
    setHistory((prev) => prev.map(item => 
      item.id === id ? { ...item, title: newTitle.trim() } : item
    ));
  };

  return (
    <HistoryContext.Provider value={{ history, saveConversation, deleteConversation, renameConversation }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
