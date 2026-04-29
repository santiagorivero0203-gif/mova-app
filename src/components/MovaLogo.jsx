/**
 * ============================================
 * MovaLogo.jsx — Logo del header
 * ============================================
 * Muestra logo-principal.png en un contenedor ovalado.
 * Al hover se despliega el eslogan.
 * Al hacer clic regresa a la pantalla de inicio (si está en cámara).
 */
import React from 'react';

export default function MovaLogo({ onGoHome }) {
  return (
    <div 
      className="group flex items-center cursor-pointer touch-manipulation origin-left hover:scale-[1.02] transition-transform duration-300"
      onClick={onGoHome}
      title="Volver al inicio"
      role="button"
      aria-label="Volver a la pantalla de inicio"
    >
      
      {/* Contenedor ovalado adaptado a la forma del logo */}
      <div className="h-11 px-4 shrink-0 flex items-center justify-center rounded-full bg-[#0e2a5a] border border-white/12 shadow-[0_2px_12px_rgba(59,130,246,0.12)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_2px_16px_rgba(255,165,0,0.2)] group-hover:border-white/20 active:scale-95">
        <img 
          src="/logo-principal.png" 
          alt="Mova" 
          className="h-7 w-auto object-contain"
        />
      </div>

      {/* 
        Eslogan desplegable: "Rompiendo el silencio"
        Se despliega al hacer hover con animación fluida.
      */}
      <div className="max-w-0 opacity-0 group-hover:max-w-[180px] group-hover:opacity-100 transition-all duration-600 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden flex items-center h-full ml-0 group-hover:ml-2.5">
        <img 
          src="/logo-slogan.png" 
          alt="Rompiendo el silencio" 
          className="h-4 w-auto object-contain shrink-0"
        />
      </div>
      
    </div>
  );
}
