import React, { createContext, useContext, useState, useEffect } from 'react';

// Default Quick Phrases
const DEFAULT_PHRASES = [
  { id: '1', label: 'Ayuda', phrase: '¡Ayuda, por favor!', icon: '⚠️', active: true },
  { id: '2', label: 'Hola', phrase: 'Hola, ¿cómo estás?', icon: '💬', active: true },
  { id: '3', label: 'Gracias', phrase: 'Muchas gracias', icon: '❤️', active: true },
  { id: '4', label: 'Baño', phrase: 'Necesito ir al baño', icon: '💧', active: true },
  { id: '5', label: 'No entiendo', phrase: 'No entiendo', icon: '❓', active: true },
  { id: '6', label: 'Adiós', phrase: 'Hasta luego', icon: '👋', active: false },
  { id: '7', label: 'Sí', phrase: 'Sí, estoy de acuerdo', icon: '👍', active: false },
  { id: '8', label: 'No', phrase: 'No', icon: '👎', active: false },
];

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [quickPhrases, setQuickPhrases] = useState(() => {
    try {
      const saved = localStorage.getItem('mova-settings-phrases');
      return saved ? JSON.parse(saved) : DEFAULT_PHRASES;
    } catch {
      return DEFAULT_PHRASES;
    }
  });

  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('mova-speech-rate')) || 1.0;
  });

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('mova-settings-phrases', JSON.stringify(quickPhrases));
  }, [quickPhrases]);

  useEffect(() => {
    localStorage.setItem('mova-speech-rate', speechRate.toString());
  }, [speechRate]);

  // Actions
  const togglePhrase = (id) => {
    setQuickPhrases(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const reorderPhrases = (dragIndex, dropIndex) => {
    setQuickPhrases((prev) => {
      const copy = [...prev];
      const item = copy.splice(dragIndex, 1)[0];
      copy.splice(dropIndex, 0, item);
      return copy;
    });
  };

  return (
    <SettingsContext.Provider value={{ 
      quickPhrases, togglePhrase, reorderPhrases, 
      speechRate, setSpeechRate
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
