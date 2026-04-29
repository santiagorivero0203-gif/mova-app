/**
 * ============================================
 * MenuScreen.jsx — Pantalla principal de Mova
 * ============================================
 * Logo grande centrado con glow. Selector deslizante.
 * Espacio superior reducido para proporciones correctas.
 */
import { useId, useRef, useState, useCallback } from 'react';
import Screen from '../components/Screen';
import { es } from '../i18n/es';

const LANGS = ['LSV', 'ASL', 'LSE'];
const FLAGS = { LSV: '🇻🇪', ASL: '🇺🇸', LSE: '🇪🇸' };

export default function MenuScreen({ isActive, language, setLanguage, onStart }) {
  const btnId = useId();
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  /** Calcula el índice del idioma basado en la posición X */
  const getIndexFromX = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const segmentWidth = rect.width / LANGS.length;
    const index = Math.round(x / segmentWidth - 0.5);
    return Math.max(0, Math.min(LANGS.length - 1, index));
  }, []);

  const handleMouseDown = (e) => {
    setDragging(true);
    setLanguage(LANGS[getIndexFromX(e.clientX)]);
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setLanguage(LANGS[getIndexFromX(e.clientX)]);
  };
  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    setDragging(true);
    setLanguage(LANGS[getIndexFromX(e.touches[0].clientX)]);
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    setLanguage(LANGS[getIndexFromX(e.touches[0].clientX)]);
  };
  const handleTouchEnd = () => setDragging(false);

  const currentIndex = LANGS.indexOf(language);

  return (
    <Screen active={isActive}>
      {/* Overlay para capturar mouse drag fuera del selector */}
      {dragging && (
        <div
          className="fixed inset-0 z-[99] cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      )}

      {/* 
        Contenedor principal: justify-center para centrado vertical real.
        pt-16 compensa el header (h-16), pb-6 da espacio inferior.
      */}
      <div className="flex flex-col items-center justify-center px-6 max-w-[500px] w-full h-full mx-auto pt-16 pb-6">
        
        {/* ======== LOGO PRINCIPAL CON GLOW ======== */}
        <div className="mb-6 flex flex-col items-center relative flex-shrink-0">
          <h1 className="sr-only">Mova — Traductor de Lenguaje de Señas</h1>
          
          {/* Resplandor detrás del logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div 
              className="w-[500px] h-[220px] rounded-full opacity-45 blur-[55px]"
              style={{ background: 'radial-gradient(ellipse, rgba(255,165,0,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 80%)' }}
            />
          </div>

          {/* Logo: 500px de ancho para máximo impacto */}
          <img 
            src="/logo-full.png" 
            alt="Mova — Rompiendo el silencio" 
            className="w-full max-w-[500px] h-auto object-contain relative z-10 drop-shadow-[0_0_28px_rgba(255,165,0,0.3)] transition-all duration-500 hover:drop-shadow-[0_0_40px_rgba(255,165,0,0.45)] hover:scale-[1.02]" 
          />
        </div>

        {/* ======== BADGE ======== */}
        <div className="text-center mb-6 flex-shrink-0">
          <span className="inline-block bg-white/10 text-orange-400 text-[0.7rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
            {es.APP_BETA}
          </span>
        </div>

        {/* ======== SELECTOR DE IDIOMA — Deslizante ======== */}
        <div 
          ref={trackRef}
          className={`relative flex bg-white/8 backdrop-blur-xl border border-white/15 rounded-[20px] p-1.5 mb-5 w-full h-14 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] select-none flex-shrink-0 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="radiogroup"
          aria-label="Seleccionar idioma de señas"
        >
          {LANGS.map((lang) => (
            <div
              key={lang}
              className={`flex-1 flex items-center justify-center text-sm font-semibold z-[2] rounded-[16px] transition-all duration-300 pointer-events-none
                ${language === lang ? 'text-white drop-shadow-sm' : 'text-white/35'}`}
            >
              <span className="mr-1.5 text-lg">{FLAGS[lang]}</span> {lang}
            </div>
          ))}
          {/* Slider pill */}
          <div
            className="absolute top-1.5 bottom-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] z-[1]"
            style={{
              width: `calc((100% - 12px) / ${LANGS.length})`,
              left: '6px',
              transform: `translateX(${currentIndex * 100}%)`,
              transition: dragging ? 'transform 0.15s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        </div>

        {/* ======== BOTÓN COMENZAR ======== */}
        <button
          id={btnId}
          onClick={onStart}
          className="w-full py-[18px] bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold border-none rounded-[20px] cursor-pointer shadow-[0_4px_20px_rgba(59,130,246,0.4)] btn-diagonal-shine btn-hover-scale transition-all duration-300 flex-shrink-0"
        >
          {es.START_BTN}
        </button>
      </div>
    </Screen>
  );
}
