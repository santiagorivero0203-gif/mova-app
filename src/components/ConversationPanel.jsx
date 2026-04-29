/**
 * ConversationPanel — Panel del Modo Conversación
 * Muestra texto construido, sugerencias y acciones.
 */

// SVG Icons inline
const IconSpace = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 14v4H6v-4"/></svg>
);
const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
);
const IconSpeak = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const IconSaveText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

export default function ConversationPanel({
  text,
  suggestions,
  onSpace,
  onDelete,
  onSpeak,
  onCopy,
  onClear,
  onSuggestionClick,
  onSaveToHistory,
}) {
  return (
    <div className="w-full rounded-ios-lg overflow-hidden shadow-2xl shadow-black/40 border border-white/10"
         style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.85))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="p-3">
        {/* Text bar */}
        <div className="bg-white/[0.08] rounded-ios p-3 min-h-[44px] flex items-center mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <span className="text-lg font-medium text-white tracking-wide font-system">
            {text || '...'}
          </span>
          <span className="text-mova-accent font-light text-xl animate-blink-cursor ml-0.5">|</span>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1 pb-2 scrollbar-hide">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => onSuggestionClick(sug)}
                className="flex-shrink-0 bg-mova-accent/15 text-mova-accent border border-mova-accent/30 rounded-full px-3.5 py-1.5 text-sm font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-mova-accent hover:text-white active:bg-mova-accent active:text-white"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          <ActionBtn onClick={onSpace} title="Espacio"><IconSpace /></ActionBtn>
          <ActionBtn onClick={onDelete} title="Borrar"><IconDelete /></ActionBtn>
          <ActionBtn onClick={onSpeak} title="Leer" accent><IconSpeak /></ActionBtn>
          <ActionBtn onClick={onCopy} title="Copiar"><IconCopy /></ActionBtn>
          <ActionBtn onClick={() => onSaveToHistory(text)} title="Guardar Frase"><IconSaveText /></ActionBtn>
          <ActionBtn onClick={onClear} title="Limpiar" danger><IconTrash /></ActionBtn>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, title, accent, danger }) {
  let cls = 'w-11 h-[38px] rounded-lg border-none flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.92] ';
  if (accent) {
    cls += 'bg-mova-accent text-white';
  } else if (danger) {
    cls += 'bg-mova-destructive/20 text-mova-destructive active:bg-mova-destructive active:text-white';
  } else {
    cls += 'bg-white/10 text-white/80 active:bg-white/20';
  }
  return (
    <button onClick={onClick} title={title} className={cls}>
      {children}
    </button>
  );
}
