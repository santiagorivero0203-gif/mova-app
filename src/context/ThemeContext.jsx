import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Inicializamos comprobando 'mova-theme' en local storage, o si las preferencias del sistema son oscuras
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('mova-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false; 
    }
  });

  const [customizationEnabled, setCustomizationEnabled] = useState(() => {
    return localStorage.getItem('mova-custom-theme-v2') === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('mova-custom-theme-v2', customizationEnabled.toString());
    
    // Remove all previous theme classes
    root.classList.remove('dark', 'light', 'theme-fixed');
    document.body.style.backgroundColor = '';

    if (!customizationEnabled) {
      // FIXED THEME
      root.classList.add('theme-fixed');
      document.body.style.backgroundColor = '#05163F';
    } else {
      // CUSTOM THEME (Dark/Light)
      if (isDarkMode) {
        root.classList.add('dark');
        localStorage.setItem('mova-theme', 'dark');
        document.body.style.backgroundColor = '#0a0a0a'; 
      } else {
        root.classList.add('light');
        localStorage.setItem('mova-theme', 'light');
        document.body.style.backgroundColor = '#F8FAFC';
      }
    }
  }, [isDarkMode, customizationEnabled]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleCustomization = () => setCustomizationEnabled((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, customizationEnabled, toggleCustomization }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
