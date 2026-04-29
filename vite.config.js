import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5501,
    host: '0.0.0.0', // Permite pruebas en la red local (celular)
    https: true,     // Requerido obligatoriamente por navegadores móviles para usar la cámara
  },
  preview: {
    port: 5502,
    host: '0.0.0.0',
    https: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mediapipe')) {
            return 'mediapipe';
          }
        }
      }
    }
  }
});
