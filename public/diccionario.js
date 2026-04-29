/**
 * ============================================
 * DICCIONARIO.JS — Motor de Autocorrección
 * ============================================
 * 
 * Sistema predictivo basado en:
 * 1. Trie (Árbol de Prefijos) para búsqueda rápida
 * 2. Levenshtein Distance para corrección de errores
 * 3. Diccionario de ~500 palabras españolas comunes
 */

// ============================================
// ESTRUCTURA TRIE
// ============================================

class NodoTrie {
    constructor() {
        this.hijos = {};
        this.esFinDePalabra = false;
        this.frecuencia = 0; // Para ranking
    }
}

class Trie {
    constructor() {
        this.raiz = new NodoTrie();
    }

    insertar(palabra) {
        let nodo = this.raiz;
        for (const char of palabra.toLowerCase()) {
            if (!nodo.hijos[char]) {
                nodo.hijos[char] = new NodoTrie();
            }
            nodo = nodo.hijos[char];
        }
        nodo.esFinDePalabra = true;
        nodo.frecuencia++;
    }

    /**
     * Busca todas las palabras que empiecen con el prefijo dado
     * @param {string} prefijo 
     * @param {number} max - Máximo de sugerencias
     * @returns {string[]}
     */
    sugerir(prefijo, max = 5) {
        let nodo = this.raiz;
        const pref = prefijo.toLowerCase();
        
        for (const char of pref) {
            if (!nodo.hijos[char]) return [];
            nodo = nodo.hijos[char];
        }

        const resultados = [];
        this._buscarTodas(nodo, pref, resultados, max);
        return resultados;
    }

    _buscarTodas(nodo, palabraActual, resultados, max) {
        if (resultados.length >= max) return;
        if (nodo.esFinDePalabra) {
            resultados.push(palabraActual);
        }
        // Ordenar hijos por frecuencia (más usadas primero)
        const hijosOrdenados = Object.keys(nodo.hijos).sort((a, b) => {
            return (nodo.hijos[b].frecuencia || 0) - (nodo.hijos[a].frecuencia || 0);
        });
        for (const char of hijosOrdenados) {
            if (resultados.length >= max) return;
            this._buscarTodas(nodo.hijos[char], palabraActual + char, resultados, max);
        }
    }
}

// ============================================
// LEVENSHTEIN DISTANCE
// ============================================

/**
 * Calcula la distancia de edición entre dos strings
 * (número mínimo de inserciones, eliminaciones o sustituciones)
 */
function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const costo = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // Eliminación
                dp[i][j - 1] + 1,      // Inserción
                dp[i - 1][j - 1] + costo // Sustitución
            );
        }
    }
    return dp[m][n];
}

// ============================================
// MOTOR DE AUTOCORRECCIÓN
// ============================================

class Autocorrector {
    constructor() {
        this.trie = new Trie();
        this.palabras = [];
        this._cargarDiccionario();
    }

    _cargarDiccionario() {
        const diccionario = [
            // === SALUDOS Y CORTESÍA ===
            'hola','adios','buenos','buenas','dias','tardes','noches','gracias',
            'por','favor','de','nada','disculpa','perdon','permiso','bienvenido',
            'bienvenida',

            // === PRONOMBRES Y ARTÍCULOS ===
            'yo','tu','el','ella','nosotros','ustedes','ellos','ellas',
            'mi','me','te','se','nos','les','lo','la','los','las',
            'un','una','unos','unas','este','esta','ese','esa','aquel',

            // === VERBOS COMUNES ===
            'ser','estar','tener','hacer','ir','venir','poder','querer',
            'saber','decir','dar','ver','comer','beber','dormir','vivir',
            'trabajar','estudiar','hablar','escuchar','leer','escribir',
            'jugar','correr','caminar','salir','entrar','abrir','cerrar',
            'comprar','vender','pagar','llamar','necesitar','gustar',
            'pensar','creer','sentir','conocer','encontrar','buscar',
            'llegar','pasar','quedar','dejar','llevar','traer','poner',
            'ayudar','esperar','empezar','terminar','usar','aprender',
            'ensenar','preguntar','responder','entender','explicar',
            'cambiar','intentar','recordar','olvidar','perder','ganar',
            'bajar','subir','nadar','cocinar','limpiar','lavar',

            // === FAMILIA ===
            'mama','papa','padre','madre','hijo','hija','hermano','hermana',
            'abuelo','abuela','tio','tia','primo','prima','sobrino','sobrina',
            'esposo','esposa','bebe','familia','amigo','amiga','novio','novia',

            // === CUERPO ===
            'mano','manos','dedo','dedos','cabeza','cara','ojo','ojos',
            'nariz','boca','oreja','brazo','pierna','pie','pies','cuerpo',
            'pelo','espalda','corazon','estomago',

            // === COMIDA Y BEBIDA ===
            'agua','leche','cafe','jugo','pan','arroz','pollo','carne',
            'pescado','huevo','fruta','manzana','platano','naranja',
            'ensalada','sopa','comida','desayuno','almuerzo','cena',
            'sal','azucar','queso','mantequilla','aceite',

            // === LUGARES ===
            'casa','escuela','hospital','tienda','iglesia','parque',
            'calle','ciudad','pueblo','pais','oficina','banco','mercado',
            'restaurante','hotel','aeropuerto','estacion','biblioteca',
            'universidad','farmacia','supermercado','plaza','edificio',

            // === TIEMPO Y CALENDARIO ===
            'hoy','ayer','manana','ahora','despues','antes','siempre',
            'nunca','lunes','martes','miercoles','jueves','viernes',
            'sabado','domingo','semana','mes','ano','hora','minuto',
            'segundo','tiempo','fecha','tarde','noche','dia',

            // === NÚMEROS (escritos) ===
            'uno','dos','tres','cuatro','cinco','seis','siete','ocho',
            'nueve','diez','cien','mil','primero','segundo','tercero',

            // === ADJETIVOS COMUNES ===
            'bueno','malo','grande','pequeno','nuevo','viejo','bonito',
            'feo','rapido','lento','facil','dificil','largo','corto',
            'caliente','frio','rico','pobre','feliz','triste','enfermo',
            'sano','importante','necesario','posible','imposible',
            'mejor','peor','mismo','diferente','libre','ocupado',
            'listo','tranquilo','contento','cansado','hambriento',

            // === PREPOSICIONES Y CONECTORES ===
            'en','con','sin','para','desde','hasta','entre','sobre',
            'bajo','contra','hacia','durante','segun','pero','porque',
            'cuando','donde','como','que','cual','quien','si','no',
            'muy','mas','menos','bien','mal','ya','aqui','ahi','alla',
            'tambien','solo','todo','mucho','poco','algo','nada',
            'otro','cada','mismo','tan','tanto',

            // === OBJETOS COTIDIANOS ===
            'telefono','computadora','mesa','silla','cama','puerta',
            'ventana','libro','papel','lapiz','bolsa','llave','ropa',
            'zapato','camisa','pantalon','vestido','reloj','dinero',
            'carro','auto','bus','tren','avion','bicicleta',

            // === EMOCIONES Y ESTADOS ===
            'amor','miedo','alegria','tristeza','dolor','hambre','sed',
            'sueno','fuerza','salud','problema','solucion','pregunta',
            'respuesta','idea','verdad','mentira','error','ayuda',

            // === NATURALEZA ===
            'sol','luna','agua','fuego','tierra','aire','cielo','mar',
            'rio','montana','arbol','flor','animal','perro','gato',
            'pajaro','lluvia','viento','nube',

            // === ACCIONES DE COMUNICACIÓN ===
            'hablar','decir','contar','pedir','repetir','traducir',
            'senal','signo','lengua','palabra','frase','letra','nombre',

            // === EDUCACIÓN ===
            'clase','profesor','maestro','alumno','tarea','examen',
            'nota','leccion','ejemplo','practica','curso','programa',

            // === TRABAJO ===
            'trabajo','empleo','jefe','companero','reunion','proyecto',
            'horario','sueldo','vacaciones',

            // === TECNOLOGÍA ===
            'internet','aplicacion','mensaje','video','foto','pantalla',
            'contrasena','correo','red','datos',

            // === FRASES ÚTILES (como palabras compuestas) ===
            'bano','medico','policia','emergencia','peligro','cuidado',
            'rapido','silencio','atencion','informacion'
        ];

        this.palabras = diccionario;
        diccionario.forEach(p => this.trie.insertar(p));
    }

    /**
     * Obtiene sugerencias basadas en el prefijo actual
     * @param {string} prefijo - Las letras acumuladas hasta ahora
     * @param {number} max - Máximo de sugerencias
     * @returns {string[]}
     */
    obtenerSugerencias(prefijo, max = 3) {
        if (!prefijo || prefijo.length < 2) return [];
        const pref = prefijo.toLowerCase();
        
        // 1. Buscar por prefijo exacto en el Trie
        const porPrefijo = this.trie.sugerir(pref, max);
        
        if (porPrefijo.length >= max) return porPrefijo.slice(0, max);

        // 2. Si no hay suficientes, buscar por Levenshtein (fuzzy)
        const fuzzy = [];
        const maxDist = pref.length <= 3 ? 1 : 2;
        
        for (const palabra of this.palabras) {
            if (porPrefijo.includes(palabra)) continue;
            // Solo comparar palabras de longitud similar
            if (Math.abs(palabra.length - pref.length) > maxDist + 1) continue;
            
            const dist = levenshtein(pref, palabra.substring(0, pref.length));
            if (dist <= maxDist) {
                fuzzy.push({ palabra, dist });
            }
        }

        // Ordenar fuzzy por distancia (más cercanas primero)
        fuzzy.sort((a, b) => a.dist - b.dist);
        
        const combinadas = [...porPrefijo, ...fuzzy.map(f => f.palabra)];
        return [...new Set(combinadas)].slice(0, max);
    }

    /**
     * Intenta corregir una palabra completa
     * @param {string} palabra - La palabra a corregir
     * @returns {string|null} - La corrección o null si no hay
     */
    corregir(palabra) {
        if (!palabra || palabra.length < 2) return null;
        const p = palabra.toLowerCase();

        // Si la palabra existe en el diccionario, no corregir
        const exactas = this.trie.sugerir(p, 1);
        if (exactas.length > 0 && exactas[0] === p) return null;

        // Buscar la palabra más cercana con Levenshtein
        let mejorPalabra = null;
        let mejorDist = Infinity;
        const maxDist = p.length <= 3 ? 1 : 2;

        for (const candidata of this.palabras) {
            const dist = levenshtein(p, candidata);
            if (dist <= maxDist && dist < mejorDist) {
                mejorDist = dist;
                mejorPalabra = candidata;
            }
        }

        return mejorPalabra;
    }
}

// Exportar globalmente para app.js
window.Autocorrector = Autocorrector;
