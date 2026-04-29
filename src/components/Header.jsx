/**
 * ============================================
 * Header.jsx — Barra superior de Mova
 * ============================================
 * Diseñada para integrarse con el fondo #05163F.
 * Fondo translúcido con blur para efecto premium.
 * El toggle de tema solo aparece si customización está activa.
 */
import React from 'react';
import MovaLogo from './MovaLogo';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onOpenHistory, onOpenSettings, onGoHome }) {
  const { isDarkMode, toggleTheme, customizationEnabled } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#05163F]/90 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
      
      {/* Lado izquierdo: Botón Menú + Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenHistory}
          className="p-2 -ml-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Historial de Conversaciones"
          aria-label="Abrir historial de conversaciones"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <MovaLogo onGoHome={onGoHome} />
      </div>

      {/* Lado derecho: Tema + Configuración */}
      <div className="flex items-center gap-2">
        {/* Toggle Modo Oscuro/Claro (Solo si la personalización está activada) */}
        {customizationEnabled && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 overflow-hidden relative w-10 h-10 flex items-center justify-center"
            title={`Cambiar a ${isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}`}
            aria-label={`Cambiar a ${isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}`}
          >
            {/* Sol */}
            <svg className={`absolute transition-transform duration-500 ${isDarkMode ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            {/* Luna */}
            <svg className={`absolute transition-transform duration-500 ${!isDarkMode ? '-translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        )}

        {/* Botón Configuración */}
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 hover:rotate-90"
          title="Configuración"
          aria-label="Abrir configuración de la aplicación"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
