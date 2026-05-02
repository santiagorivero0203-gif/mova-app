import React, { useState, useEffect } from 'react';

export default function LanguageInfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('mova_languages_seen');
    if (!hasSeen) {
      // Show with a small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('mova_languages_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-mova-surface/95 backdrop-blur-xl w-full max-w-sm rounded-ios-xl overflow-hidden shadow-2xl animate-slide-up border border-white/10 flex flex-col">
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-mova-accent/10 dark:bg-mova-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl" aria-hidden="true">🌍</span>
          </div>
          <h2 className="text-xl font-bold font-system text-mova-text-primary dark:text-white mb-2">
            Idiomas Disponibles
          </h2>
          <p className="text-sm text-mova-text-secondary dark:text-mova-text-secondary-dark mb-6">
            Mova soporta diferentes lenguajes de señas. Selecciona el adecuado para ti:
          </p>
          
          <div className="space-y-3 text-left">
            <div className="bg-mova-bg p-3 rounded-lg border border-white/5 transition-colors">
              <div className="font-bold text-sm text-mova-text-primary dark:text-white flex items-center gap-2">
                <span>🇻🇪</span> LSV
              </div>
              <p className="text-xs text-mova-text-secondary dark:text-mova-text-secondary-dark mt-1">
                Lengua de Señas Venezolana.
              </p>
            </div>
            
            <div className="bg-mova-bg p-3 rounded-lg border border-white/5 transition-colors">
              <div className="font-bold text-sm text-mova-text-primary dark:text-white flex items-center gap-2">
                <span>🇺🇸</span> ASL
              </div>
              <p className="text-xs text-mova-text-secondary dark:text-mova-text-secondary-dark mt-1">
                American Sign Language (Lengua de Señas Americana).
              </p>
            </div>
            
            <div className="bg-mova-bg p-3 rounded-lg border border-white/5 transition-colors">
              <div className="font-bold text-sm text-mova-text-primary dark:text-white flex items-center gap-2">
                <span>🇪🇸</span> LSE
              </div>
              <p className="text-xs text-mova-text-secondary dark:text-mova-text-secondary-dark mt-1">
                Lengua de Signos Española.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10">
          <button 
            onClick={handleClose}
            className="w-full py-3 bg-mova-accent text-white font-semibold rounded-ios-lg hover:opacity-90 transition-opacity btn-hover-scale shadow-button"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
