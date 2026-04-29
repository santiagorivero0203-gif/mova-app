/**
 * AddSignModal — Modal para enseñar señas personalizadas a Mova
 */
import { useState, useRef, useEffect } from 'react';
import { CONEXIONES } from '../core/SignDetector.js';

export default function AddSignModal({ isOpen, landmarks, onSave, onCancel }) {
  const [name, setName] = useState('');
  const canvasRef = useRef(null);

  // Dibujar preview cuando cambian los landmarks
  useEffect(() => {
    if (!isOpen || !landmarks || !canvasRef.current) return;
    drawPreview(canvasRef.current, landmarks);
  }, [isOpen, landmarks]);

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex justify-center items-center animate-fade-in"
         style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="bg-mova-surface w-[90%] max-w-[320px] p-8 rounded-ios-xl shadow-soft flex flex-col items-center text-center animate-slide-up">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-mova-success/10 flex items-center justify-center mb-5">
          <span className="text-2xl">✨</span>
        </div>

        <h2 className="text-xl font-bold mb-2 text-mova-text-primary dark:text-white transition-colors">Aprender Seña</h2>

        {/* Preview Canvas */}
        <div className="w-40 h-40 rounded-ios bg-mova-bg dark:bg-mova-bg-dark border-2 border-dashed border-black/10 dark:border-white/10 mb-5 overflow-hidden flex justify-center items-center transition-colors">
          <canvas ref={canvasRef} width={200} height={200} className="w-full h-full object-contain" />
        </div>

        <p className="text-sm text-mova-text-secondary dark:text-mova-text-secondary-dark mb-6 leading-relaxed transition-colors">
          ¿Es esta la postura correcta? Ponle un significado:
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Significado (Ej: Rock)..."
          maxLength={15}
          autoComplete="off"
          className="w-full px-4 py-3.5 border border-black/10 dark:border-white/10 rounded-lg text-base font-system mb-6 bg-mova-secondary dark:bg-mova-secondary-dark text-mova-text-primary dark:text-white outline-none transition-all duration-200 focus:border-mova-accent focus:bg-mova-surface dark:focus:bg-mova-surface-dark focus:ring-[3px] focus:ring-mova-accent/15"
        />

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-mova-secondary dark:bg-mova-secondary-dark text-mova-accent dark:text-mova-accent-light font-semibold border-none rounded-ios-lg cursor-pointer btn-hover-scale hover:bg-mova-secondary/80 dark:hover:bg-mova-secondary-dark/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-mova-accent text-white font-semibold border-none rounded-ios-lg cursor-pointer shadow-button btn-diagonal-shine btn-hover-scale"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Dibuja el esqueleto de la mano en el canvas del modal */
function drawPreview(canvas, landmarks) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bounding box
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  landmarks.forEach((lm) => {
    if (lm.x < minX) minX = lm.x;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.y > maxY) maxY = lm.y;
  });

  const margin = 0.1;
  minX = Math.max(0, minX - margin);
  minY = Math.max(0, minY - margin);
  maxX = Math.min(1, maxX + margin);
  maxY = Math.min(1, maxY + margin);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const escalaX = canvas.width / rangeX;
  const escalaY = canvas.height / rangeY;

  // Conexiones
  ctx.strokeStyle = 'rgba(142, 142, 147, 0.5)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  CONEXIONES.forEach(([inicio, fin]) => {
    const p1 = landmarks[inicio];
    const p2 = landmarks[fin];
    ctx.beginPath();
    ctx.moveTo(canvas.width - ((p1.x - minX) * escalaX), (p1.y - minY) * escalaY);
    ctx.lineTo(canvas.width - ((p2.x - minX) * escalaX), (p2.y - minY) * escalaY);
    ctx.stroke();
  });

  // Puntos
  ctx.fillStyle = '#4ecca3';
  landmarks.forEach((lm, index) => {
    ctx.beginPath();
    ctx.arc(
      canvas.width - ((lm.x - minX) * escalaX),
      (lm.y - minY) * escalaY,
      index === 0 ? 6 : 4,
      0, 2 * Math.PI
    );
    ctx.fill();
  });
}
