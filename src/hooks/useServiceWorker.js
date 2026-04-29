import { useEffect } from 'react';

export default function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(r => console.log('✓ SW PWA registrado:', r.scope))
        .catch(e => console.warn('SW no disponible:', e));
    }
    console.log('🖐️ Mova v2 — App Ready');
  }, []);
}
