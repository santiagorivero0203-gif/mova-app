import { ChevronLeft, ChatIcon, PlusIcon } from '../components/icons';
import Screen from '../components/Screen';
import ConversationPanel from '../components/ConversationPanel';
import { hablarTexto } from '../core/Speech';
import { es } from '../i18n/es';
import { DEDOS } from '../constants';

export default function CameraScreen({
  isActive,
  hand,
  conv,
  quickPhrases,
  countdownActive,
  countdownValue,
  signEmoji,
  signLabel,
  onStartCapture,
  onSaveHistory
}) {
  return (
    <Screen active={isActive}>
      {/* 100dvh covers the entire screen robustly, no padding needed for Header since it's hidden */}
      <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col">
        
        {/* Video Background - Fullscreen absolute con optimización de Native Player */}
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            ref={hand.setVideoElement} 
            playsInline 
            autoPlay 
            muted 
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ 
              transform: hand.facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' 
            }}
          />
          <canvas 
            ref={hand.setCanvasElement} 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          />
        </div>

        {/* Floating UI Overlay Layer - Desplazado pt-16 para respetar el Header global */}
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none justify-between pt-16">
          
          {/* Top Bar Navigation (Semi-transparent) */}
          <nav className="relative w-full h-[60px] flex items-center px-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
            {/* Left */}
            <div className="absolute left-4">
              <button 
                onClick={hand.stop} 
                className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border-none text-white cursor-pointer flex items-center gap-1 font-semibold btn-hover-scale hover:bg-white/30 shadow-md min-h-[48px] min-w-[48px] justify-center"
                aria-label="Volver al menú principal"
              >
                <ChevronLeft /> {es.BACK_BTN}
              </button>
            </div>
            
            {/* Center */}
            <div className="w-full flex justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-md">
                <span className="w-2 h-2 bg-mova-success rounded-full animate-blink shadow-[0_0_8px_#34C759]" />
                <span className="text-xs font-semibold text-white uppercase tracking-widest">{es.LIVE_LABEL}</span>
              </div>
            </div>

            {/* Right */}
            <div className="absolute right-4 flex items-center gap-2">
              <button
                onClick={hand.toggleCamera}
                title="Cambiar Cámara"
                aria-label="Alternar entre cámara frontal y cámara trasera"
                className="bg-black/60 backdrop-blur-md text-white h-7 w-8 flex items-center justify-center rounded-md border border-white/20 hover:bg-white/30 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>

              <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 h-7 flex items-center rounded-md border border-white/20">
                {hand.fps || 0} FPS
              </div>
              <button
                onClick={conv.toggle}
                title="Modo Conversación"
                aria-label="Activar o desactivar modo de conversación"
                aria-expanded={conv.isActive}
                className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl ${conv.isActive ? 'bg-mova-accent text-white shadow-[0_0_15px_rgba(0,122,255,0.8)] scale-110' : 'bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 hover:scale-105'}`}
              >
                <ChatIcon />
              </button>
            </div>
          </nav>

          {/* Central Area: Floating emojis, countdowns */}
          <div className="flex-1 relative flex items-center justify-center w-full">
            {/* Floating Sign Card */}
            <div className={`absolute transition-all duration-500 ease-out flex items-center gap-3 px-6 py-2.5 rounded-full shadow-card ${conv.isActive ? 'top-4' : 'bottom-4'} bg-white/90 dark:bg-mova-surface-dark/90`}
                 style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <span className="text-3xl drop-shadow-sm" role="status" aria-live="polite">{signEmoji}</span>
              <span className="font-bold text-xl text-mova-text-primary dark:text-white">{signLabel}</span>
            </div>

            {/* Countdown Overlay */}
            {countdownActive && (
              <div className="absolute text-[150px] font-extrabold text-white z-[200] animate-fade-in"
                   style={{ textShadow: '0 0 50px rgba(0,122,255,0.9), 0 8px 16px rgba(0,0,0,0.6)' }}>
                {countdownValue}
              </div>
            )}
          </div>

          {/* Bottom Controls Area */}
          <div className="w-full flex flex-col pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
            
            {/* Conversation Panel Context */}
            {conv.isActive && (
              <div className="px-4 pb-2 -mt-4 animate-slide-up w-full max-w-4xl mx-auto">
                <ConversationPanel
                  text={conv.text}
                  suggestions={conv.suggestions}
                  onSpace={conv.agregarEspacio}
                  onDelete={conv.borrarUltimo}
                  onSpeak={conv.leerTexto}
                  onCopy={conv.copiarTexto}
                  onClear={conv.limpiar}
                  onSuggestionClick={conv.aplicarSugerencia}
                  onSaveToHistory={onSaveHistory}
                />
              </div>
            )}

            {/* Quick Actions Carousel */}
            <div className="w-full flex overflow-x-auto px-4 py-3 gap-3 scrollbar-hide">
              {quickPhrases.filter(p => p.active).map((qp) => (
                <button
                  key={qp.id}
                  onClick={() => hablarTexto(qp.phrase)}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/10 px-[18px] py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer btn-hover-scale hover:bg-white/30 transition-colors shadow-sm min-h-[48px]"
                  aria-label={`Decir: ${qp.phrase}`}
                >
                  <span>{qp.icon}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
              {quickPhrases.filter(p => p.active).length === 0 && (
                 <div className="text-sm text-white/70 italic py-2 px-2 drop-shadow-md">{es.NO_QUICK_ACTIONS}</div>
              )}
            </div>

            {/* FAB Add Sign (Now integrated in flow horizontally for better landscape handling, or absolutely positioned) */}
            <div className="absolute bottom-32 right-5 pointer-events-auto">
              <button
                onClick={onStartCapture}
                title="Enseñar a Mova"
                aria-label="Añadir una nueva seña personalizada"
                className="w-14 h-14 rounded-full bg-mova-accent text-white border border-white/20 shadow-[0_8px_32px_rgba(0,122,255,0.5)] flex items-center justify-center cursor-pointer btn-diagonal-shine btn-hover-scale hover:scale-110"
              >
                <PlusIcon />
              </button>
            </div>

            {/* Bottom Sheet - Finger Status */}
            <div className="w-full bg-white/10 dark:bg-black/40 backdrop-blur-xl px-5 pb-6 pt-4 border-t border-white/10">
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 text-center">
                {es.ARTICULATION_POINTS}
              </div>
              <div className="flex justify-between w-full max-w-xl mx-auto">
                {DEDOS.map((nombre) => (
                  <div key={nombre} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/80">{nombre}</span>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${hand.hasHands ? 'bg-mova-success shadow-[0_0_12px_rgba(52,199,89,0.8)] scale-110' : 'bg-white/20'}`} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Screen>
  );
}
