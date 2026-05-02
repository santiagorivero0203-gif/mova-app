/**
 * ============================================
 * useConversation.js — Custom Hook para Modo Conversación
 * ============================================
 * Gestiona el modo de construcción de frases letra a letra.
 */

import { useState, useRef, useCallback, useMemo, useTransition } from 'react';
import { Autocorrector } from '../core/Autocorrector.js';
import { hablarTexto } from '../core/Speech.js';

const CONV_FRAMES_PARA_LETRA = 20;  // ~0.7s a 30fps
const CONV_FRAMES_PARA_ESPACIO = 45; // ~1.5s sin mano = espacio

export default function useConversation() {
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isPending, startTransition] = useTransition();

  const autocorrector = useMemo(() => new Autocorrector(), []);

  const trackingRef = useRef({
    ultimaLetra: '',
    framesLetra: 0,
    framesSinMano: 0,
  });

  const isActiveRef = useRef(false);

  const toggle = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      isActiveRef.current = next;
      if (!next) {
        setText('');
        setSuggestions([]);
      }
      return next;
    });
  }, []);

  const agregarEspacio = useCallback(() => {
    startTransition(() => {
      setText((prev) => {
        let newText = prev;
        
        // Autocorregir última palabra
        if (newText.length > 0) {
          const palabras = newText.split(' ');
          const ultimaPalabra = palabras[palabras.length - 1];
          if (ultimaPalabra.length >= 2) {
            const correccion = autocorrector.corregir(ultimaPalabra);
            if (correccion) {
              palabras[palabras.length - 1] = correccion;
              newText = palabras.join(' ');
            }
          }
        }

        const result = newText + ' ';
        updateSuggestions(result);
        return result;
      });
    });
  }, [autocorrector]);

  const borrarUltimo = useCallback(() => {
    startTransition(() => {
      setText((prev) => {
        const result = prev.slice(0, -1);
        updateSuggestions(result);
        return result;
      });
    });
  }, []);

  const leerTexto = useCallback(() => {
    setText((current) => {
      if (current.trim()) hablarTexto(current.trim());
      return current;
    });
  }, []);

  const copiarTexto = useCallback(async () => {
    // We grab the text via the ref pattern
    let currentText = '';
    setText(t => { currentText = t; return t; });
    if (currentText.trim() && navigator.clipboard) {
      await navigator.clipboard.writeText(currentText.trim());
      return true;
    }
    return false;
  }, []);

  const limpiar = useCallback(() => {
    setText('');
    setSuggestions([]);
    trackingRef.current = { ultimaLetra: '', framesLetra: 0, framesSinMano: 0 };
  }, []);

  const aplicarSugerencia = useCallback((sugerencia) => {
    startTransition(() => {
      setText((prev) => {
        const palabras = prev.split(' ');
        palabras[palabras.length - 1] = sugerencia;
        const result = palabras.join(' ') + ' ';
        updateSuggestions(result);
        return result;
      });
    });
  }, []);

  const updateSuggestions = useCallback((currentText) => {
    const palabras = currentText.split(' ');
    const palabraActual = palabras[palabras.length - 1];

    if (palabraActual && palabraActual.length >= 2) {
      const sugs = autocorrector.obtenerSugerencias(palabraActual, 3);
      setSuggestions(sugs);
    } else {
      setSuggestions([]);
    }
  }, [autocorrector]);

  /**
   * Llamado cada frame desde el loop de detección.
   * Acumula letras y auto-agrega espacios.
   */
  const processFrame = useCallback((letraDetectada) => {
    if (!isActiveRef.current) return;

    const tracking = trackingRef.current;

    if (letraDetectada && letraDetectada !== '-') {
      tracking.framesSinMano = 0;

      if (letraDetectada === tracking.ultimaLetra) {
        tracking.framesLetra++;

        if (tracking.framesLetra === CONV_FRAMES_PARA_LETRA) {
          startTransition(() => {
            setText((prev) => {
              const result = prev + letraDetectada.toLowerCase();
              updateSuggestions(result);
              return result;
            });
          });
          tracking.framesLetra = -999; // Evitar repetición
        }
      } else {
        tracking.ultimaLetra = letraDetectada;
        tracking.framesLetra = 0;
      }
    } else {
      tracking.framesSinMano++;
      tracking.framesLetra = 0;
      tracking.ultimaLetra = '';

      if (tracking.framesSinMano === CONV_FRAMES_PARA_ESPACIO) {
        startTransition(() => {
          setText((prev) => {
            if (prev.length > 0 && !prev.endsWith(' ')) {
              agregarEspacio();
            }
            return prev;
          });
        });
      }
    }
  }, [agregarEspacio, updateSuggestions]);

  return {
    isActive,
    text,
    suggestions,
    toggle,
    agregarEspacio,
    borrarUltimo,
    leerTexto,
    copiarTexto,
    limpiar,
    aplicarSugerencia,
    processFrame,
  };
}
