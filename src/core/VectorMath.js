/**
 * ============================================
 * VectorMath.js — Utilidades Matemáticas
 * ============================================
 * Funciones matemáticas para análisis de landmarks.
 * Extraídas de app.js y convertidas en módulo ES.
 */

/**
 * Distancia euclidiana 3D entre dos landmarks
 * @param {{x: number, y: number, z: number}} lm1 
 * @param {{x: number, y: number, z: number}} lm2 
 * @returns {number}
 */
export function calcDistancia(lm1, lm2) {
  if (!lm1 || !lm2) return 0;
  return Math.sqrt(
    (lm1.x - lm2.x) ** 2 +
    (lm1.y - lm2.y) ** 2 +
    ((lm1.z || 0) - (lm2.z || 0)) ** 2
  );
}

/**
 * Distancia euclidiana 2D (ignora Z)
 * @param {{x: number, y: number}} lm1 
 * @param {{x: number, y: number}} lm2 
 * @returns {number}
 */
export function calcDistancia2D(lm1, lm2) {
  if (!lm1 || !lm2) return 0;
  return Math.sqrt(
    (lm1.x - lm2.x) ** 2 +
    (lm1.y - lm2.y) ** 2
  );
}

/**
 * Evalúa si un dedo está extendido comparando distancias.
 * Margen del 8% para reducir falsos positivos.
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} pipIdx 
 * @param {number} puntaIdx 
 * @returns {boolean}
 */
export function dedoAbierto(landmarks, pipIdx, puntaIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const muneca = landmarks[0];
  const pip = landmarks[pipIdx];
  const punta = landmarks[puntaIdx];
  const dPunta = calcDistancia(muneca, punta);
  const dPip = calcDistancia(muneca, pip);
  return dPunta > dPip * 1.08;
}

/**
 * Evalúa si un dedo está en posición de "garra"
 * (ni totalmente abierto ni totalmente cerrado).
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} mcpIdx 
 * @param {number} pipIdx 
 * @param {number} puntaIdx 
 * @returns {boolean}
 */
export function dedoGarra(landmarks, mcpIdx, pipIdx, puntaIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const punta = landmarks[puntaIdx];
  const dPuntaMcp = calcDistancia(mcp, punta);
  const dPipMcp = calcDistancia(mcp, pip);
  const palma = landmarks[0];
  const dPuntaPalma = calcDistancia(palma, punta);
  const escalaPalma = calcDistancia(palma, landmarks[9]);
  return dPuntaMcp < dPipMcp * 1.3 && dPuntaPalma > escalaPalma * 0.35;
}

/**
 * Calcula el vector euclidiano normalizado (20D)
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @returns {number[]}
 */
export function calcularVectorNormalizado(landmarks) {
  if (!landmarks || landmarks.length < 21) return Array(20).fill(0);
  const escala = calcDistancia(landmarks[0], landmarks[9]);
  if (escala === 0) return Array(20).fill(0);

  const vector = [];
  for (let i = 1; i <= 20; i++) {
    const dist = calcDistancia(landmarks[0], landmarks[i]);
    vector.push(dist / escala);
  }
  return vector;
}

/**
 * Evalúa si un dedo apunta horizontalmente (para G, H, P, Q).
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} mcpIdx 
 * @param {number} puntaIdx 
 * @returns {boolean}
 */
export function dedoHorizontal(landmarks, mcpIdx, puntaIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const mcp = landmarks[mcpIdx];
  const punta = landmarks[puntaIdx];
  const dx = Math.abs(punta.x - mcp.x);
  const dy = Math.abs(punta.y - mcp.y);
  return dx > dy * 1.2;
}

/**
 * Evalúa si un dedo está en forma de gancho (para X).
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} mcpIdx 
 * @param {number} pipIdx 
 * @param {number} puntaIdx 
 * @returns {boolean}
 */
export function dedoGancho(landmarks, mcpIdx, pipIdx, puntaIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const punta = landmarks[puntaIdx];
  const dPuntaPip = calcDistancia(punta, pip);
  const dMcpPip = calcDistancia(mcp, pip);
  return dPuntaPip < dMcpPip * 0.7 &&
    dMcpPip > calcDistancia(landmarks[0], landmarks[9]) * 0.25;
}

/**
 * Evalúa si índice y medio están cruzados (para R).
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @returns {boolean}
 */
export function dedosCruzados(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const puntaIndice = landmarks[8];
  const puntaMedio = landmarks[12];
  const pipIndice = landmarks[6];
  const pipMedio = landmarks[10];
  const escalaPalma = calcDistancia(landmarks[0], landmarks[9]);
  const dPuntas = calcDistancia(puntaIndice, puntaMedio);
  const dPips = calcDistancia(pipIndice, pipMedio);
  return dPuntas < escalaPalma * 0.15 && dPuntas < dPips * 0.6;
}

/**
 * Evalúa si la punta de un dedo toca la punta del pulgar
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} puntaIdx 
 * @param {number} umbral 
 * @returns {boolean}
 */
export function puntaTocaPulgar(landmarks, puntaIdx, umbral) {
  if (!landmarks || landmarks.length < 21) return false;
  const escalaPalma = calcDistancia(landmarks[0], landmarks[9]);
  const dist = calcDistancia(landmarks[4], landmarks[puntaIdx]);
  return dist / escalaPalma < umbral;
}

/**
 * Evalúa si un punto está por delante de otro en el eje Z
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} idxEnFrente 
 * @param {number} idxDetras 
 * @returns {boolean}
 */
export function puntoAdelante(landmarks, idxEnFrente, idxDetras) {
  if (!landmarks || landmarks.length < 21) return false;
  const escalaPalma = calcDistancia(landmarks[0], landmarks[9]);
  if (escalaPalma === 0) return false;
  const diffZ = (landmarks[idxDetras].z - landmarks[idxEnFrente].z) / escalaPalma;
  return diffZ > 0.03;
}

/**
 * Evalúa si la mano está rotada de perfil
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @returns {boolean}
 */
export function manoPerfil(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const dx = Math.abs(landmarks[5].x - landmarks[17].x);
  const dz = Math.abs(landmarks[5].z - landmarks[17].z);
  return dz > dx * 0.8;
}
