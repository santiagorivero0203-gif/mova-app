/**
 * ============================================
 * SW.JS - Service Worker para Funcionalidad Offline
 * ============================================
 * 
 * Este archivo permite que la app funcione sin conexión a internet.
 * El Service Worker:
 * 1. Guarda en caché los archivos de la app
 * 2. Sirve los archivos desde el caché cuando no hay internet
 * 3. Se actualiza cuando hay nueva versión disponible
 */

// ============================================
// CONFIGURACIÓN DEL CACHÉ
// ============================================

/** Nombre de la caché donde se guardan los archivos */
const NOMBRE_CACHE = 'mova-v4';

/** Archivos a guardar en caché para funcionar offline */
const ARCHIVOS_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './wasm/vision_bundle.mjs',
    './wasm/vision_wasm_internal.js',
    './wasm/vision_wasm_internal.wasm',
    './models/hand_landmarker.task'
];

// ============================================
// EVENTO: INSTALACIÓN
// ============================================

/**
 * Se ejecuta cuando el Service Worker se instala.
 * Guarda todos los archivos en caché.
 */
self.addEventListener('install', (evento) => {
    console.log('[SW] Instalando Service Worker...');
    
    evento.waitUntil(
        caches.open(NOMBRE_CACHE)
            .then((cache) => {
                console.log('[SW] Guardando archivos en caché...');
                // Guardar archivos locales
                return cache.addAll(ARCHIVOS_CACHE);
            })
            .then(() => {
                console.log('[SW] Archivos guardados correctamente');
                // Saltar espera y activar inmediatamente
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error al guardar caché:', error);
            })
    );
});

// ============================================
// EVENTO: ACTIVACIÓN
// ============================================

/**
 * Se ejecuta cuando el Service Worker se activa.
 * Limpia caches antiguos si hay.
 */
self.addEventListener('activate', (evento) => {
    console.log('[SW] Activando Service Worker...');
    
    evento.waitUntil(
        caches.keys()
            .then((nombresCaches) => {
                // Eliminar caches que no sean el actual
                return Promise.all(
                    nombresCaches
                        .filter((nombre) => nombre !== NOMBRE_CACHE)
                        .map((nombre) => {
                            console.log('[SW] Eliminando caché antiguo:', nombre);
                            return caches.delete(nombre);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activo');
                // Tomar control inmediatamente
                return self.clients.claim();
            })
    );
});

// ============================================
// EVENTO: PETICIONES (FETCH)
// ============================================

/**
 * Se ejecuta cada vez que se hace una petición de red.
 * Si el archivo está en caché, lo sirve desde ahí.
 * Si no, hace la petición normal.
 */
self.addEventListener('fetch', (evento) => {
    const url = new URL(evento.request.url);
    
    // Ignorar peticiones de extensiones del navegador
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Ignorar peticiones de audio/video
    if (evento.request.destination === 'audio' || 
        evento.request.destination === 'video') {
        return;
    }
    
    evento.respondWith(
        caches.match(evento.request)
            .then((respuestaCaché) => {
                // Si hay respuesta en caché, usarla
                if (respuestaCaché) {
                    console.log('[SW] Sirviendo desde caché:', url.pathname);
                    return respuestaCaché;
                }
                
                // Si no hay en caché, hacer petición a la red
                console.log('[SW] Obteniendo de la red:', url.pathname);
                return fetch(evento.request)
                    .then((respuestaRed) => {
                        // No guardar respuestas de errores
                        if (!respuestaRed || respuestaRed.status !== 200) {
                            return respuestaRed;
                        }
                        
                        // Guardar en caché la respuesta (excepto streaming)
                        if (respuestaRed.type === 'basic') {
                            const respuestaClonada = respuestaRed.clone();
                            caches.open(NOMBRE_CACHE)
                                .then((cache) => {
                                    cache.put(evento.request, respuestaClonada);
                                });
                        }
                        
                        return respuestaRed;
                    })
                    .catch((error) => {
                        console.error('[SW] Error de red:', error);
                        
                        // Para páginas HTML, mostrar mensaje offline
                        if (evento.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        return new Response('Sin conexión', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ============================================
// MENSAJES DEL主线程
// ============================================

/**
 * Permite comunicación entre la app y el Service Worker.
 * Útil para forzar actualizaciones o limpiar caché.
 */
self.addEventListener('message', (evento) => {
    if (evento.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (evento.data === 'clearCache') {
        caches.delete(NOMBRE_CACHE).then(() => {
            console.log('[SW] Caché limpiada');
        });
    }
});

// ============================================
// ACTUALIZACIONES
// ============================================

/**
 * Detecta cuando hay una nueva versión del Service Worker
 * y notifica a la app para que muestre un mensaje al usuario.
 */
self.addEventListener('updatefound', () => {
    console.log('[SW] Nueva versión disponible');
    
    // Notificar a todos los clientes
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'NEW_VERSION',
                message: 'Nueva versión disponible. Recarga para actualizar.'
            });
        });
    });
});

console.log('[SW] Service Worker cargado');
