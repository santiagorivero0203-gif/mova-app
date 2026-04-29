import { useState, useCallback } from 'react';
import { es } from '../i18n/es';

export default function useSignCapture(hand) {
  const [modalOpen, setModalOpen] = useState(false);
  const [capturedLandmarks, setCapturedLandmarks] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [isFlashing, setIsFlashing] = useState(false);

  const startCapture = useCallback(() => {
    if (countdownActive) return;
    setCountdownActive(true);
    setCountdownValue(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
      } else {
        clearInterval(interval);
        setCountdownActive(false);

        // Capture
        const lm = hand.getCurrentLandmarks();
        if (!lm) {
          alert(es.HAND_NOT_DETECTED);
          return;
        }

        // Flash in React
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);

        setCapturedLandmarks(lm);
        setModalOpen(true);
      }
    }, 1000);
  }, [countdownActive, hand]);

  const handleSaveSign = useCallback((name) => {
    if (hand.learnSign(name)) {
      setModalOpen(false);
      setCapturedLandmarks(null);
    }
  }, [hand]);

  const cancelCapture = useCallback(() => {
    setModalOpen(false);
    setCapturedLandmarks(null);
  }, []);

  return {
    modalOpen,
    capturedLandmarks,
    countdownActive,
    countdownValue,
    isFlashing,
    startCapture,
    handleSaveSign,
    cancelCapture
  };
}
