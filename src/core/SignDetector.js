/**
 * ============================================
 * SignDetector.js — Motor de Detección de Señas
 * ============================================
 * Motor multi-dialecto para 24 letras estáticas del alfabeto.
 * Migrado desde app.js detectarFigura().
 */

import {
  calcDistancia,
  dedoAbierto,
  dedoGarra,
  calcularVectorNormalizado,
  dedoHorizontal,
  dedoGancho,
  dedosCruzados,
  puntoAdelante,
  pulgarRecogido,
  trazoJ,
  trazoZ
} from './VectorMath.js';

export const UMBRAL_SIMILITUD = 0.07;
export const UMBRAL_TOQUE = 0.45;
export const UMBRAL_PULGAR_OUT = 0.65;

/** Mapa de letras a emojis representativos */
export const FIGURAS = {
  'A': '🅰️', 'B': '🅱️', 'C': '🌙', 'D': '👆',
  'E': '🇪',  'F': '👌', 'G': '👉', 'H': '🤞',
  'I': 'ℹ️', 'J': '🪝', 'K': '🤘', 'L': '🤙',
  'M': 'Ⓜ️', 'N': '🇳',  'O': '⭕', 'P': '🅿️',
  'Q': '🔽', 'R': '®️',  'S': '💪', 'T': '✝️',
  'U': '🤞', 'V': '✌️', 'W': '🖖', 'X': '❌',
  'Y': '🤙', 'Z': '⚡'
};

/** Conexiones entre landmarks para dibujar la estructura de la mano */
export const CONEXIONES = [
  // Pulgar
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Índice
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Medio
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Anular
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Meñique
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palma
  [5, 9], [9, 13], [13, 17], [0, 17]
];

/**
 * Motor de Detección Multi-Dialecto
 * Detecta 24 letras estáticas del lenguaje de señas.
 * @param {Array} landmarks - 21 puntos de referencia de la mano
 * @param {Array} senasPersonalizadas - Señas custom del usuario
 * @param {Array} historial - Historial de frames para gestos dinámicos
 * @returns {{ nombre: string, afinidad: number|null }}
 */
export function detectarFigura(landmarks, senasPersonalizadas = [], historial = []) {
  let afinidadVectorial = null;

  // 1. SEÑAS PERSONALIZADAS (IA) - prioridad máxima
  if (senasPersonalizadas.length > 0) {
    const vectorActual = calcularVectorNormalizado(landmarks);
    let mejorSena = null;
    let menorError = Infinity;

    for (const sena of senasPersonalizadas) {
      let errorAcumulado = 0;
      for (let i = 0; i < 20; i++) {
        errorAcumulado += Math.abs(sena.vector[i] - vectorActual[i]);
      }
      const errorPromedio = errorAcumulado / 20;

      if (errorPromedio <= UMBRAL_SIMILITUD && errorPromedio < menorError) {
        menorError = errorPromedio;
        mejorSena = sena.nombre;
        afinidadVectorial = Math.round((1 - errorPromedio) * 100);
      }
    }

    if (mejorSena != null) {
      return { nombre: mejorSena, afinidad: afinidadVectorial };
    }
  }

  // 2. DETECCIÓN DEL ALFABETO (24 letras estáticas)
  if (!landmarks || landmarks.length < 21) return { nombre: '-', afinidad: null };

  // === ESTADO DE CADA DEDO ===
  const iAb = dedoAbierto(landmarks, 6, 8);
  const mAb = dedoAbierto(landmarks, 10, 12);
  const aAb = dedoAbierto(landmarks, 14, 16);
  const meAb = dedoAbierto(landmarks, 18, 20);
  const pAb = dedoAbierto(landmarks, 2, 4);

  // === GARRAS (para E, C) ===
  const iGarra = dedoGarra(landmarks, 5, 6, 8);
  const mGarra = dedoGarra(landmarks, 9, 10, 12);
  const aGarra = dedoGarra(landmarks, 13, 14, 16);
  const meGarra = dedoGarra(landmarks, 17, 18, 20);

  // === DISTANCIAS ESTRUCTURALES ===
  const escalaPalma = calcDistancia(landmarks[0], landmarks[9]);
  if (escalaPalma === 0) return { nombre: '-', afinidad: null };

  const dPulgar_Indice  = calcDistancia(landmarks[4], landmarks[8])  / escalaPalma;
  const dPulgar_Medio   = calcDistancia(landmarks[4], landmarks[12]) / escalaPalma;
  const dPulgar_Anular  = calcDistancia(landmarks[4], landmarks[16]) / escalaPalma;
  const dPulgar_Menique = calcDistancia(landmarks[4], landmarks[20]) / escalaPalma;

  // === DETECCIÓN O ===
  const puntasCercaPulgar = [
    dPulgar_Indice  < UMBRAL_TOQUE,
    dPulgar_Medio   < UMBRAL_TOQUE,
    dPulgar_Anular  < UMBRAL_TOQUE,
    dPulgar_Menique < UMBRAL_TOQUE
  ].filter(Boolean).length;
  const formandoO = dPulgar_Indice < 0.35 && dPulgar_Medio < 0.35 && puntasCercaPulgar >= 2;

  // === CONTEOS GENERALES ===
  const dedosCerrados = [iAb, mAb, aAb, meAb].filter(d => !d).length;
  const todosAbajo = dedosCerrados === 4;
  const garras = [iGarra, mGarra, aGarra, meGarra].filter(Boolean).length;

  // === PULGAR SEPARADO (A vs E/S) ===
  const distPulgarNudillo = calcDistancia(landmarks[4], landmarks[5]);
  const ratioPulgarSeparado = distPulgarNudillo / escalaPalma;
  const pulgarClaramenteAfuera = ratioPulgarSeparado > UMBRAL_PULGAR_OUT;

  // === POSICIÓN PULGAR (S vs T vs M vs N) ===
  const dPulgar_PipIndice = calcDistancia(landmarks[4], landmarks[6]) / escalaPalma;
  const dPulgar_PipMedio  = calcDistancia(landmarks[4], landmarks[10]) / escalaPalma;
  const dPulgar_PipAnular = calcDistancia(landmarks[4], landmarks[14]) / escalaPalma;

  // === HORIZONTALIDAD (G, H) ===
  const indiceHorizontal = dedoHorizontal(landmarks, 5, 8);
  const medioHorizontal  = dedoHorizontal(landmarks, 9, 12);

  // === ORIENTACIÓN (P, Q: mano apuntando abajo) ===
  const manoApuntaAbajo = landmarks[12].y > landmarks[0].y && landmarks[8].y > landmarks[0].y;

  // ============================================================
  // DETECCIÓN DINÁMICA (CON HISTORIAL)
  // ============================================================
  // Para J: meñique extendido, movimiento curvo
  if (meAb && !iAb && !mAb && !aAb && trazoJ(historial)) return { nombre: 'J', afinidad: null };
  // Para Z: índice extendido, movimiento zig-zag
  if (iAb && !mAb && !aAb && !meAb && trazoZ(historial)) return { nombre: 'Z', afinidad: null };

  // ============================================================
  // DETECCIÓN ESTÁTICA POR PRIORIDAD
  // ============================================================

  // Se relaja aAb para Y e I porque el tendón del anular suele levantarse al estirar el meñique
  // Y: Pulgar lejos del índice. I: Pulgar cerca del índice/palma.
  if (meAb && !iAb && !mAb && dPulgar_Indice > 0.6) return { nombre: 'Y', afinidad: null };
  if (meAb && !iAb && !mAb && dPulgar_Indice < 0.55) return { nombre: 'I', afinidad: null };
  
  if (dPulgar_Indice < 0.35 && !iAb && mAb && aAb && meAb) return { nombre: 'F', afinidad: null };
  // P (Se movió al bloque jerárquico abajo)
  if (manoApuntaAbajo && pAb && iAb && !mAb && !aAb && !meAb) return { nombre: 'Q', afinidad: null };
  
  if (indiceHorizontal && !mAb && !aAb && !meAb) return { nombre: 'G', afinidad: null };
  if (indiceHorizontal && medioHorizontal && !aAb && !meAb) return { nombre: 'H', afinidad: null };
  if (iAb && !mAb && !aAb && !meAb && !indiceHorizontal && puntasCercaPulgar >= 1 && dPulgar_Medio < 0.45) return { nombre: 'D', afinidad: null };
  
  if (formandoO) return { nombre: 'O', afinidad: null };
  if (garras >= 3 && dPulgar_Indice > 0.35 && dPulgar_Indice < 0.8 && !formandoO) return { nombre: 'C', afinidad: null };
  
  // ============================================================
  // BLOQUE JERÁRQUICO: ÍNDICE Y MEDIO EXTENDIDOS (P, K, R, V, U)
  // ============================================================
  if (iAb && mAb && !aAb && !meAb) {
    const distPuntasIM = calcDistancia(landmarks[8], landmarks[12]) / escalaPalma;
    // P: Mano apuntando hacia abajo
    if (manoApuntaAbajo && dPulgar_Medio < 0.45) return { nombre: 'P', afinidad: null };
    // K: Pulgar tocando el PIP del medio, sin esconderse bajo el anular
    if (dPulgar_PipMedio < 0.4 && dPulgar_Anular > 0.4 && !manoApuntaAbajo) return { nombre: 'K', afinidad: null };
    // R: Dedos índice y medio cruzados
    if (dedosCruzados(landmarks) && !manoApuntaAbajo) return { nombre: 'R', afinidad: null };
    // V: Dedos separados
    if (distPuntasIM > 0.35 && !manoApuntaAbajo) return { nombre: 'V', afinidad: null };
    // U: Dedos juntos (y mano no apuntando abajo ni horizontal)
    if (!indiceHorizontal && !manoApuntaAbajo) return { nombre: 'U', afinidad: null };
  }
  if (pAb && iAb && !mAb && !aAb && !meAb && !formandoO) return { nombre: 'L', afinidad: null };
  if (dedoGancho(landmarks, 5, 6, 8) && !mAb && !aAb && !meAb) return { nombre: 'X', afinidad: null };
  if (iAb && mAb && aAb && meAb && !pAb) return { nombre: 'B', afinidad: null };
  
  // W: Índice, medio, anular extendidos. Pulgar sujeta el meñique.
  if (iAb && mAb && aAb && !meAb && dPulgar_Menique < 0.5) return { nombre: 'W', afinidad: null };

  // LETRAS DE PUÑO CERRADO (A, E, S, T, M, N)
  if (todosAbajo) {
    if (pulgarClaramenteAfuera) return { nombre: 'A', afinidad: null };
    // M: Pulgar debajo del anular/meñique
    if (pulgarRecogido(landmarks, 14, 0.4) || pulgarRecogido(landmarks, 18, 0.4)) return { nombre: 'M', afinidad: null };
    // N: Pulgar debajo del medio
    if (pulgarRecogido(landmarks, 10, 0.4) && !pulgarRecogido(landmarks, 14, 0.4)) return { nombre: 'N', afinidad: null };
    // T: Pulgar debajo del índice
    if (pulgarRecogido(landmarks, 6, 0.4) && !pulgarRecogido(landmarks, 10, 0.4)) return { nombre: 'T', afinidad: null };
    // S: Pulgar envuelve los dedos por delante
    if (puntoAdelante(landmarks, 4, 10) && dPulgar_PipIndice > 0.3) return { nombre: 'S', afinidad: null };
    
    return { nombre: 'E', afinidad: null };
  }

  if (garras >= 3) return { nombre: 'E', afinidad: null };

  return { nombre: '-', afinidad: null };
}
