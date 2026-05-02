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
  return Math.sqrt(calcDistanciaCuadrada(lm1, lm2));
}

/**
 * Distancia euclidiana al cuadrado (Optimizada sin Math.sqrt)
 */
export function calcDistanciaCuadrada(lm1, lm2) {
  if (!lm1 || !lm2) return 0;
  return (
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
  const dPuntaSq = calcDistanciaCuadrada(muneca, landmarks[puntaIdx]);
  const dPipSq = calcDistanciaCuadrada(muneca, landmarks[pipIdx]);
  // 1.08 al cuadrado = 1.1664
  return dPuntaSq > dPipSq * 1.1664;
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
  const dPuntaMcpSq = calcDistanciaCuadrada(mcp, landmarks[puntaIdx]);
  const dPipMcpSq = calcDistanciaCuadrada(mcp, landmarks[pipIdx]);
  const dPuntaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[puntaIdx]);
  const escalaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[9]);
  // 1.3^2 = 1.69, 0.35^2 = 0.1225
  return dPuntaMcpSq < dPipMcpSq * 1.69 && dPuntaPalmaSq > escalaPalmaSq * 0.1225;
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
  const dPuntaPipSq = calcDistanciaCuadrada(landmarks[puntaIdx], landmarks[pipIdx]);
  const dMcpPipSq = calcDistanciaCuadrada(landmarks[mcpIdx], landmarks[pipIdx]);
  const escalaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[9]);
  // 0.7^2 = 0.49, 0.25^2 = 0.0625
  return dPuntaPipSq < dMcpPipSq * 0.49 && dMcpPipSq > escalaPalmaSq * 0.0625;
}

/**
 * Evalúa si índice y medio están cruzados (para R).
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @returns {boolean}
 */
export function dedosCruzados(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const escalaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[9]);
  const dPuntasSq = calcDistanciaCuadrada(landmarks[8], landmarks[12]);
  const dPipsSq = calcDistanciaCuadrada(landmarks[6], landmarks[10]);
  // 0.15^2 = 0.0225, 0.6^2 = 0.36
  return dPuntasSq < escalaPalmaSq * 0.0225 && dPuntasSq < dPipsSq * 0.36;
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
  const escalaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[9]);
  const distSq = calcDistanciaCuadrada(landmarks[4], landmarks[puntaIdx]);
  return distSq < escalaPalmaSq * (umbral * umbral);
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

/**
 * Evalúa si el pulgar está recogido debajo o cerca de un nudillo (Para M, N, T)
 * @param {Array<{x:number, y:number, z:number}>} landmarks 
 * @param {number} targetIdx 
 * @param {number} umbral
 * @returns {boolean}
 */
export function pulgarRecogido(landmarks, targetIdx, umbral = 0.4) {
  if (!landmarks || landmarks.length < 21) return false;
  const escalaPalmaSq = calcDistanciaCuadrada(landmarks[0], landmarks[9]);
  const distSq = calcDistanciaCuadrada(landmarks[4], landmarks[targetIdx]);
  return distSq < escalaPalmaSq * (umbral * umbral);
}

/**
 * Evalúa si el historial de posiciones de la punta del meñique forma una 'J'.
 * @param {Array<Array<{x,y,z}>>} historial 
 * @returns {boolean}
 */
export function trazoJ(historial) {
  if (!historial || historial.length < 10) return false;
  const puntas = historial.map(h => h[20]); // Punta del meñique
  const inicio = puntas[0];
  let maxDescenso = 0;
  let idxDescenso = 0;

  // Buscar el punto más bajo (y mayor)
  for (let i = 1; i < puntas.length; i++) {
    if (puntas[i].y > puntas[idxDescenso].y) {
      idxDescenso = i;
      maxDescenso = puntas[i].y - inicio.y;
    }
  }

  // Verificar si después del punto más bajo hay una subida (curva)
  const fin = puntas[puntas.length - 1];
  const subida = puntas[idxDescenso].y - fin.y;
  const movHorizontal = Math.abs(fin.x - inicio.x);

  return maxDescenso > 0.05 && subida > 0.01 && movHorizontal > 0.02;
}

/**
 * Evalúa si el historial de posiciones de la punta del índice forma una 'Z'.
 * @param {Array<Array<{x,y,z}>>} historial 
 * @returns {boolean}
 */
export function trazoZ(historial) {
  if (!historial || historial.length < 15) return false;
  const puntas = historial.map(h => h[8]); // Punta del índice
  const inicio = puntas[0];
  const fin = puntas[puntas.length - 1];
  
  // Z tiene un ancho y alto
  let minX = inicio.x, maxX = inicio.x;
  let minY = inicio.y, maxY = inicio.y;
  
  for (const p of puntas) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Movimiento en zig-zag implica que cubrimos el ancho y alto,
  // y no es solo una línea recta.
  return width > 0.05 && height > 0.05 && Math.abs(fin.y - inicio.y) > 0.04;
}
