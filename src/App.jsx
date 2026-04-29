/**
 * ============================================
 * App.jsx — Mova v2 (React + Tailwind)
 * ============================================
 * Pantallas: Menu → Carga → Cámara → Error
 * Todas las funcionalidades del app.js original migradas.
 */

import { useState } from 'react';
import useHandTracking from './hooks/useHandTracking.js';
import useConversation from './hooks/useConversation.js';
import useSignCapture from './hooks/useSignCapture.js';
import useServiceWorker from './hooks/useServiceWorker.js';
import { useSettings } from './context/SettingsContext.jsx';
import { useHistory } from './context/HistoryContext.jsx';
import { FIGURAS } from './core/SignDetector.js';
import MenuScreen from './screens/MenuScreen.jsx';
import LoadingScreen from './screens/LoadingScreen.jsx';
import CameraScreen from './screens/CameraScreen.jsx';
import ErrorScreen from './screens/ErrorScreen.jsx';

import AddSignModal from './components/AddSignModal.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import LanguageInfoModal from './components/LanguageInfoModal.jsx';
import { es } from './i18n/es.js';
import { Capacitor } from '@capacitor/core';

import { HandIcon, ChevronLeft, ChatIcon, PlusIcon, CameraIcon, CheckIcon, ErrorIcon } from './components/icons';
import { DEDOS } from './constants';
import Screen from './components/Screen';

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [language, setLanguage] = useState('LSV');

  // Contexts
  const { quickPhrases } = useSettings();
  const { saveConversation } = useHistory();

  // Drawers/Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Conversation hook
  const conv = useConversation();

  // Hand tracking hook (le pasamos processFrame para que cuente letras internamente a 30fps)
  const hand = useHandTracking({
    onFrameProcess: conv.processFrame
  });

  // Carga condicional: ServiceWorker (PWA) solo arranca si estamos en Web puro,
  // ignorando la carga en entornos nativos iOS/Android para ahorrar batería y recursos.
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    useServiceWorker();
  }

  // Modal y lógica de captura de señas
  const {
    modalOpen,
    capturedLandmarks,
    countdownActive,
    countdownValue,
    isFlashing,
    startCapture,
    handleSaveSign,
    cancelCapture
  } = useSignCapture(hand);

  // Derive emoji for detected sign
  const signEmoji = FIGURAS[hand.detectedSign.nombre] || (hand.detectedSign.afinidad ? '✨' : '🖐️');
  const signLabel = hand.detectedSign.afinidad
    ? `${hand.detectedSign.nombre} (${hand.detectedSign.afinidad}%)`
    : hand.detectedSign.nombre === '-' ? '...' : hand.detectedSign.nombre;

  // ============================================
  // RENDER
  // ============================================
  // Se aplican inline styles de iOS Safe Area margin para soportar el Notch y botones home nativos.
  return (
    <div 
      className="w-full h-full relative font-system bg-mova-bg dark:bg-mova-bg-dark transition-colors duration-300"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      
      {/* ================ GLOBAL HEADER ================ */}
      <Header 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={hand.stop}
      />

      {/* ================ SCREENS ================ */}
      <div className={`fixed inset-0 bg-white z-[99999] pointer-events-none transition-opacity duration-300 ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

      <MenuScreen 
        isActive={hand.status === 'idle'} 
        language={language} 
        setLanguage={setLanguage} 
        onStart={hand.start} 
      />

      <LoadingScreen
        isActive={hand.status === 'loading'}
        text={hand.loadingText}
      />

      <CameraScreen
        isActive={hand.status === 'active'}
        hand={hand}
        conv={conv}
        quickPhrases={quickPhrases}
        countdownActive={countdownActive}
        countdownValue={countdownValue}
        signEmoji={signEmoji}
        signLabel={signLabel}
        onStartCapture={startCapture}
        onSaveHistory={(text) => { saveConversation(text); conv.limpiar(); setIsHistoryOpen(true); }}
      />

      <ErrorScreen
        isActive={hand.status === 'error'}
        errorMessage={hand.errorMessage}
        onRetry={hand.start}
        onBack={hand.stop}
      />

      {/* ================ GLOBAL MODALS & SIDEBAR ================ */}
      <AddSignModal
        isOpen={modalOpen}
        landmarks={capturedLandmarks}
        onSave={handleSaveSign}
        onCancel={cancelCapture}
      />
      <Sidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <LanguageInfoModal />
    </div>
  );
}


