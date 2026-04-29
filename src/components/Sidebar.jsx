/**
 * ============================================
 * Sidebar.jsx — Panel lateral de historial
 * ============================================
 * Diseño adaptado al tema fijo #05163F.
 * Drawer con fondo oscuro translúcido y bordes sutiles.
 */
import React from 'react';
import { useHistory } from '../context/HistoryContext';

export default function Sidebar({ isOpen, onClose }) {
  const { history, deleteConversation, renameConversation } = useHistory();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-[#0a1f4a] border-r border-white/10 shadow-[8px_0_40px_rgba(0,0,0,0.4)] z-50 transform transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-system font-bold text-white">Conversaciones</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Lista de Historial */}
        <div className="p-4 overflow-y-auto h-[calc(100%-73px)] space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-white/30 mt-10">
              <span className="block text-4xl mb-3 opacity-50">📂</span>
              <p>No tienes conversaciones guardadas.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="group bg-white/5 p-4 rounded-[16px] relative hover:bg-white/8 transition-all border border-white/5 hover:border-white/10">
                <div className="pr-8">
                  <h3 className="font-semibold text-white text-sm truncate" 
                      title="Doble clic para renombrar"
                      onDoubleClick={() => {
                        const newName = window.prompt("Renombrar conversación:", item.title);
                        if(newName) renameConversation(item.id, newName);
                      }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/30 mt-1 truncate">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-white/60 mt-2 line-clamp-3">
                    "{item.text}"
                  </p>
                </div>
                {/* Delete button (shows on hover) */}
                <button 
                  onClick={() => deleteConversation(item.id)}
                  className="absolute top-2 right-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-full"
                  title="Eliminar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
