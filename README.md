# Mova v2 — Sistema de Reconocimiento y Traducción

**Mova** es un proyecto basado en Inteligencia Artificial impulsado por `@mediapipe/hands` que traduce leguaje de señas manual a texto hablado de forma ultraligera en tiempo real y offline.
La versión actual de la arquitectura ha sido reescrita en **React 18** y está optimizada simultáneamente para Web y Native Android.

## 🚀 Tecnologías Principales
- **Core Lógico**: React + Vite (HMR Ultra-rápido)
- **Motor Científico**: MediaPipe Visión + Canvas JS
- **Motor de Sintetizado**: JavaScript SpeechSynthesis API Global.
- **Diseño**: TailwindCSS, Variables Dinámicas UI/UX Apple.
- **Empaquetado Nativo**: CapacitorJS.

---

## 💻 Desarrollo Web Local

Si deseas correr la versión de navegador orientada a desarrollo:

```bash
# Instalar dependencias
npm install

# Correr servidor (Accessible by 0.0.0.0 for LAN testing)
npm run dev

# Generar archivos minificados de Producción
npm run build
```

---

## 📱 Empaquetando la APK para Android (Capacitor)

El código fuente actual se comparte mágicamente entre componentes web y App Móvil sin necesidad de Kotlin manual gracias a **CapacitorJS**.
Mova ya tiene el ecosistema inyectado, para empaquetarlo debes:

1. **Compilar el entorno web final**:
   ```bash
   npm run build
   ```
2. **Sincronizar el puente de Capacitor**:
   ```bash
   npx cap sync android
   ```
3. **Abrir Android Studio (Requisito Indispensable)**:
   ```bash
   npx cap open android
   ```
   > Una vez el editor haya finalizado de compilar Gradle, puedes conectar por cable tu teléfono, presionar el botón `Play` ▶️ o irte a `Build > Build Bundle(s) / APK(s) > Build APK`.

## ♿ Promesa Multiplataforma
Mova garantiza accesibilidad total en esta compilación. Posee:
- Áreas de toque y Padding calculados respecto a la pantalla/Notch de iPhones modernos mediante constantes de entorno WebKit de PWA.
- Anunciantes activos (`aria-live`) tras la lectura y Focus visual dinámico para soporte universal a teclados de lectores visuales.

---
_Creado con visión progresiva para accesibilidad universal por el equipo Kurios / U-Code._
