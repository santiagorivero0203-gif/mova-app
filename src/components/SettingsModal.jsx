/**
 * ============================================
 * SettingsModal.jsx — Modal de configuración
 * ============================================
 * Diseño adaptado al tema fijo #05163F.
 * Fondos translúcidos, bordes sutiles, colores coherentes.
 */
import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { quickPhrases, togglePhrase, reorderPhrases, speechRate, setSpeechRate } = useSettings();
  const { isDarkMode, toggleTheme, customizationEnabled, toggleCustomization } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0a1f4a] w-full max-w-md rounded-[24px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-slide-up flex flex-col max-h-[90vh] border border-white/10">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold font-system text-white">Configuración</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Contenido SCROLLABLE */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Sección: Apariencia */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Apariencia</h3>
            
            {/* Toggle Personalización */}
            <div className="bg-white/5 p-4 rounded-[16px] flex items-center justify-between border border-white/8 mb-3">
              <div>
                <span className="text-sm font-semibold text-white block">Temas Personalizados</span>
                <span className="text-xs text-white/40">Desbloquea el modo claro y oscuro</span>
              </div>
              <button
                onClick={toggleCustomization}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${customizationEnabled ? 'bg-green-500' : 'bg-white/15'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${customizationEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Toggle Modo Oscuro (Solo visible si está habilitado) */}
            {customizationEnabled && (
              <div className="bg-white/5 p-4 rounded-[16px] flex items-center justify-between border border-white/8 animate-fade-in">
                <span className="text-sm font-semibold text-white">Modo Oscuro</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-blue-500' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
          </div>

          {/* Sección: Síntesis de Voz */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Síntesis de Voz</h3>
            <div className="bg-white/5 p-4 rounded-[16px] flex flex-col gap-2 border border-white/8">
              <label className="text-sm font-semibold text-white flex justify-between">
                <span>Velocidad de Lectura</span>
                <span className="text-orange-400">{speechRate}x</span>
              </label>
              <input 
                type="range" 
                min="0.5" max="2.0" step="0.1" 
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>Lento</span>
                <span>Rápido</span>
              </div>
            </div>
          </div>

          {/* Sección: Accesos Rápidos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Accesos Rápidos Base</h3>
            <p className="text-xs text-white/30 mb-3">
              Activa, desactiva o reordena los botones que aparecen debajo de la cámara.
            </p>
            <div className="bg-white/5 rounded-[16px] border border-white/8 overflow-hidden">
              {quickPhrases.map((phrase, index) => (
                <div key={phrase.id} className="group flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  
                  {/* Info */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{phrase.icon}</span>
                    <span className={`font-semibold text-sm ${phrase.active ? 'text-white' : 'text-white/30 line-through'}`}>
                      {phrase.label}
                    </span>
                  </div>

                  {/* Controles: Reordenar + Switch */}
                  <div className="flex items-center gap-2">
                    {/* Botones de Reordenar */}
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={index === 0}
                        onClick={() => reorderPhrases(index, index - 1)}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      </button>
                      <button 
                        disabled={index === quickPhrases.length - 1}
                        onClick={() => reorderPhrases(index, index + 1)}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => togglePhrase(phrase.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${phrase.active ? 'bg-green-500' : 'bg-white/15'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${phrase.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-[14px] hover:opacity-90 transition-opacity btn-hover-scale shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
