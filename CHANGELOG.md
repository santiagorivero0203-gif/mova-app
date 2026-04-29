# Registro de Cambios (Changelog) - Mova

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.

## [2.0.0] - 2026-04-12

### Añadido (Added)
- **Empaquetamiento Android Nativo**: Integración exitosa con CapacitorJS (`@capacitor/core`). La aplicación ahora es compilable como APK a través de Android Studio manteniendo el mismo código React.
- **Flujo de PWA Premium**: Añadidos meta tags completos para instalaciones PWA inmersivas en iOS/Android (`viewport-fit=cover`, `apple-mobile-web-app-status-bar-style`).
- **Accesibilidad (A11y)**:
  - Atributos `aria-label` insertados en todos los botones visuales/SVG.
  - Soporte de anillo envolvente al hacer foco mediante teclado (`:focus-visible`).
  - El Canvas de la cámara ahora ignora toques (`touch-action: none`) para evitar desplazamientos accidentales.
- **Herramientas de Red Local**: Vite configurado con `host: '0.0.0.0'` y chunking avanzado para mejor distribución en móviles vía Wi-Fi.

### Modificado (Changed)
- **Arquitectura Ultrasónica**: Modulación completa del monolítico `App.jsx`. Pantallas separadas como `MenuScreen.jsx` y `CameraScreen.jsx`.
- **UI de Cámara Orgánica**: El flujo de cámara ahora es estéticamente inmersivo tomando `100dvh`, con herramientas flotantes y translúcidas posicionadas de modo absoluto.
- **Motor JSDoc**: La matemática espacial (`VectorMath.js`) y el reconocimiento analítico fueron protegidos y fuertemente tipados.
- **Botones Inteligentes**: Garantizado el tamaño mínimo táctil de 48px según estándares Material Design para botones base flotantes.

### Eliminado (Removed)
- Manipulación grosera del DOM nativo (ej. `document.createElement`) eliminada y reemplazada por flujos limpios de Virtual DOM en React.
- Dependencias o variables mágicas CSS solapadas depuradas hacia Tailwind v3 config pura.
