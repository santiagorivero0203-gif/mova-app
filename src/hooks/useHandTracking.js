/**
 * ============================================
 * useHandTracking.js — Custom Hook de MediaPipe
 * ============================================
 * Encapsula toda la lógica de:
 *  - Inicialización del detector
 *  - Streaming de cámara
 *  - Frame loop (requestAnimationFrame)
 *  - Dibujo de landmarks en canvas
 *  - Detección de figuras/señas
 *
 * Expone estado reactivo limpio para los componentes.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { detectarFigura, CONEXIONES, FIGURAS } from '../core/SignDetector.js';
import { calcularVectorNormalizado } from '../core/VectorMath.js';
import { hablarTexto } from '../core/Speech.js';
import { CustomSignsManager } from '../core/CustomSignsManager.js';

const FRAMES_PARA_HABLAR = 25;

import { Capacitor } from '@capacitor/core';

// === Detección de Plataforma y Hardware Eficiente ===
const isMobile = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android' || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = Capacitor.getPlatform() === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent);

// Configuraciones Responsivas de Rendimiento
const DEVICE_CONFIG = {
  // Delegate: Restauramos la lógica original. En celulares forzar WebGL (GPU) mueve la textura excesivamente matando CPU, 
  // pero en Desktop (PCs) la GPU es inmensamente más rápida.
  delegate: isMobile ? 'CPU' : 'GPU',
  // Permitimos 1280x720 (16:9) como ideal para evitar que el navegador recorte el sensor
  // y haga un efecto de "zoom extremo" al intentar forzar 640x480 (4:3).
  cameraWidth: { ideal: 1280 },
  cameraHeight: { ideal: 720 }
};

/**
 * @returns Hook state & control functions for hand tracking
 */
export default function useHandTracking(options = {}) {
  const { onFrameProcess } = options;
  // === Estado Reactivo ===
  const [status, setStatus] = useState('idle'); // idle | loading | active | error
  const [loadingText, setLoadingText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fps, setFps] = useState(0);
  const [handsCount, setHandsCount] = useState(0);
  const [detectedSign, setDetectedSign] = useState({ nombre: '-', afinidad: null });
  const [hasHands, setHasHands] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  // === Refs (no reactivos, para el frame loop veloz sin bloqueos) ===
  const facingModeRef = useRef('user');
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const activeRef = useRef(false);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
  const latestResultsRef = useRef(null);
  const signTrackingRef = useRef({
    lastSpoken: '',
    sustainedFrames: 0,
    currentSign: '-',
    candidateSign: '-',
    candidateFrames: 0,
  });
  const landmarksHistoryRef = useRef([]); // Historial de frames para letras dinámicas

  // Optimizaciones extremas para evitar Render Thrashing (60 FPS)
  const handsCountRef = useRef(0);
  const hasHandsRef = useRef(false);

  // Señas personalizadas (persistidas en localStorage)
  const customSignsRef = useRef(CustomSignsManager.load());

  // === Asignar refs a elementos DOM ===
  const setVideoElement = useCallback((el) => { videoRef.current = el; }, []);
  const setCanvasElement = useCallback((el) => { canvasRef.current = el; }, []);

  // === Inicializar Detector ===
  const initDetector = useCallback(async () => {
    setStatus('loading');
    setLoadingText('Cargando motor de IA...');

    try {
      // Construimos la URL dinámicamente para evitar que Vite intente
      // resolver el import estáticamente (los archivos viven en /public)
      const wasmPath = new URL('/wasm/vision_bundle.mjs', window.location.origin).href;
      const mediapipe = await import(/* @vite-ignore */ wasmPath);
      const { FilesetResolver, HandLandmarker } = mediapipe;

      setLoadingText('Resolviendo binarios WASM...');
      const archivos = await FilesetResolver.forVisionTasks('/wasm');

      setLoadingText('Configurando detector...');
      const detector = await HandLandmarker.createFromOptions(archivos, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
          delegate: DEVICE_CONFIG.delegate, 
        },
        numHands: DEVICE_CONFIG.numHands, 
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      detectorRef.current = detector;
      console.log('✓ Detector de manos inicializado');
      return detector;
    } catch (error) {
      console.error('Error al inicializar detector:', error);
      throw error;
    }
  }, []);

  // === Iniciar Cámara ===
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingModeRef.current,
          width: DEVICE_CONFIG.cameraWidth,
          height: DEVICE_CONFIG.cameraHeight,
        },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');

      video.srcObject = stream;
      streamRef.current = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      console.log('✓ Cámara iniciada');
      return stream;
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      throw error;
    }
  }, []);

  // === Frame Loop ===
  const processFrame = useCallback((timestamp) => {
    if (!activeRef.current || !detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      requestAnimationFrame(processFrame);
      return;
    }

    try {
      const results = detectorRef.current.detectForVideo(video, timestamp);
      latestResultsRef.current = results;

      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Solo limpiamos capa overlay

        // ¡IMPORTANTE!: Eliminamos el pesado `ctx.drawImage` (dibujo del video completo en CPU).
        // El nodo nativo <video> de HTML5 (o entorno WebView) pinta tras el canvas en GPU sin penalizar el JS Thread.

        if (results.landmarks && results.landmarks.length > 0) {
          const isFrontCamera = facingModeRef.current === 'user';
          drawLandmarks(ctx, results.landmarks, results.handednesses, canvas.width, canvas.height, isFrontCamera);
          if (handsCountRef.current !== results.landmarks.length) {
            handsCountRef.current = results.landmarks.length;
            setHandsCount(results.landmarks.length);
          }
          if (!hasHandsRef.current) {
            hasHandsRef.current = true;
            setHasHands(true);
          }

          // Guardar en el historial
          landmarksHistoryRef.current.push(results.landmarks[0]);
          if (landmarksHistoryRef.current.length > 25) {
            landmarksHistoryRef.current.shift();
          }

          // Detectar seña
          const detection = detectarFigura(results.landmarks[0], customSignsRef.current, landmarksHistoryRef.current);
          updateSignTracking(detection);
          if (onFrameProcess) onFrameProcess(detection.nombre);
        } else {
          if (handsCountRef.current !== 0) {
            handsCountRef.current = 0;
            setHandsCount(0);
          }
          if (hasHandsRef.current) {
            hasHandsRef.current = false;
            setHasHands(false);
          }
          landmarksHistoryRef.current = []; // Limpiar historial si no hay manos
          updateSignTracking({ nombre: '-', afinidad: null });
          if (onFrameProcess) onFrameProcess('-');
        }
      }

      // FPS
      const fpsData = fpsCounterRef.current;
      fpsData.frames++;
      if (timestamp - fpsData.lastTime >= 1000) {
        setFps(fpsData.frames);
        fpsData.frames = 0;
        fpsData.lastTime = timestamp;
      }
    } catch (error) {
      console.error('Error en procesamiento:', error);
    }

    if (activeRef.current) {
      requestAnimationFrame(processFrame);
    }
  }, []);

  // === Sign Tracking (speech + sustained detection) ===
  const updateSignTracking = useCallback((detection) => {
    const tracking = signTrackingRef.current;

    // Sistema de histéresis (Anti-jitter)
    // Para estabilizar el estado de React y evitar repintados excesivos (caída a 7fps)
    if (detection.nombre === tracking.candidateSign) {
      tracking.candidateFrames++;
    } else {
      tracking.candidateSign = detection.nombre;
      tracking.candidateFrames = 1;
    }

    // Sólo actualizar el estado de React cuando la seña sea estable (mínimo 3 frames seguidos)
    // O si no hay ninguna seña detectada ('-')
    if ((tracking.candidateFrames >= 3 || detection.nombre === '-') && detection.nombre !== tracking.currentSign) {
      tracking.currentSign = detection.nombre;
      tracking.sustainedFrames = 0;
      setDetectedSign(detection);
    } else if (tracking.currentSign !== '-') {
      tracking.sustainedFrames++;
      // Hablar texto después de un tiempo prolongado de mantener la misma seña
      if (tracking.sustainedFrames === FRAMES_PARA_HABLAR && tracking.lastSpoken !== tracking.currentSign) {
        hablarTexto(tracking.currentSign);
        tracking.lastSpoken = tracking.currentSign;
      }
    }

    if (detection.nombre === '-') {
      tracking.lastSpoken = '';
    }
  }, []);

  // === Drawing Functions ===
  const drawLandmarks = useCallback((ctx, landmarks, handednesses, width, height, isFrontCamera) => {
    const colores = [
      { lineas: '#4ecca3', puntos: '#38b2ac' },
      { lineas: '#e94560', puntos: '#ff6b6b' },
    ];

    landmarks.forEach((mano, idx) => {
      const color = colores[idx % colores.length];

      // Función de mapa estático X
      // Restaurado: Ya que el canvas NO tiene CSS invertido (para no afectar texto/imágenes futuras), 
      // y la cámara SÍ lo tiene, invertimos X manualmente en la data proyectada.
      const mapX = (x) => isFrontCamera ? (1 - x) * width : x * width;

      // Conexiones (Path unificado para mejor rendimiento FPS)
      ctx.strokeStyle = color.lineas;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      CONEXIONES.forEach(([inicio, fin]) => {
        const p1 = mano[inicio];
        const p2 = mano[fin];
        ctx.moveTo(mapX(p1.x), p1.y * height);
        ctx.lineTo(mapX(p2.x), p2.y * height);
      });
      ctx.stroke();

      // Puntos (Optimizados en un solo path para reducir llamadas al motor gráfico 95%)
      ctx.fillStyle = color.puntos;
      ctx.beginPath();
      mano.forEach((punto, i) => {
        const x = mapX(punto.x);
        const y = punto.y * height;
        const radio = i === 0 ? 8 : 5;
        ctx.moveTo(x + radio, y);
        ctx.arc(x, y, radio, 0, 2 * Math.PI);
      });
      ctx.fill();

      // Puntas resaltadas
      const pulgar = mano[4];
      ctx.fillStyle = '#ffd369';
      ctx.beginPath();
      ctx.arc(mapX(pulgar.x), pulgar.y * height, 10, 0, 2 * Math.PI);
      ctx.fill();

      const menique = mano[20];
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(mapX(menique.x), menique.y * height, 10, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, []);

  // === Public API ===
  const start = useCallback(async () => {
    try {
      await initDetector();
      await initCamera();
      setStatus('active');
      activeRef.current = true;
      fpsCounterRef.current = { frames: 0, lastTime: performance.now() };
      requestAnimationFrame(processFrame);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }, [initDetector, initCamera, processFrame]);

  const toggleCamera = useCallback(async () => {
    const newMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = newMode;
    setFacingMode(newMode);
    
    // Detener la cámara actual y reiniciar
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    // Si ya estábamos activos, iniciar automáticamente de nuevo
    if (activeRef.current) {
      try {
        await initCamera();
      } catch (err) {
        setStatus('error');
        setErrorMessage('Error al cambiar de cámara');
      }
    }
  }, [initCamera]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStatus('idle');
    setHandsCount(0);
    setHasHands(false);
    setDetectedSign({ nombre: '-', afinidad: null });
    console.log('✓ Detección detenida');
  }, []);

  // Aprender seña personalizada
  const learnSign = useCallback((name) => {
    const results = latestResultsRef.current;
    if (!results?.landmarks?.[0]) return false;

    const landmarks = results.landmarks[0];
    const vector = calcularVectorNormalizado(landmarks);

    const newSign = { nombre: name, vector };
    
    // Add via Manager
    CustomSignsManager.addSign(name, vector);
    
    // Update local ref 
    customSignsRef.current = customSignsRef.current.filter(s => s.nombre !== name);
    customSignsRef.current.push(newSign);

    // Agregar al mapa de emojis
    FIGURAS[name] = '✨';
    
    hablarTexto('Seña aprendida: ' + name);
    return true;
  }, []);

  // Obtener landmarks actuales (para preview)
  const getCurrentLandmarks = useCallback(() => {
    const results = latestResultsRef.current;
    if (!results?.landmarks?.[0]) return null;
    return JSON.parse(JSON.stringify(results.landmarks[0]));
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    // State
    status,
    loadingText,
    errorMessage,
    fps,
    handsCount,
    detectedSign,
    hasHands,

    // Ref setters
    setVideoElement,
    setCanvasElement,

    // Controls
    start,
    stop,
    toggleCamera,
    learnSign,
    getCurrentLandmarks,
    facingMode, // Exportamos facingMode para que el componente asigne el scale CSS correctamente.
  };
}
