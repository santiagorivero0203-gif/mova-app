/**
 * ============================================
 * Speech.js — Utilidad de Síntesis de Voz
 * ============================================
 */

export const SpeechEngine = {
  get isSupported() {
    return 'speechSynthesis' in window;
  },

  get defaultRate() {
    const rateStr = localStorage.getItem('mova-speech-rate');
    return rateStr ? parseFloat(rateStr) : 1.0;
  },

  speak(texto, options = {}) {
    if (!this.isSupported) return;

    this.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    
    utterance.lang = options.lang || 'es-ES';
    utterance.rate = options.rate || this.defaultRate;
    utterance.pitch = options.pitch || 1.1;
    
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options.voice) {
      utterance.voice = options.voice;
    }

    window.speechSynthesis.speak(utterance);
  },

  cancel() {
    if (this.isSupported) window.speechSynthesis.cancel();
  }
};

/** Compatibilidad hacia atrás para el resto de la app */
export function hablarTexto(texto) {
  SpeechEngine.speak(texto);
}
