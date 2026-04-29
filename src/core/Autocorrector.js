/**
 * ============================================
 * Autocorrector.js — Motor de Autocorrección
 * ============================================
 * Sistema predictivo Trie + Levenshtein.
 * Migrado desde diccionario.js a módulo ES.
 */

// ============================================
// ESTRUCTURA TRIE
// ============================================

class NodoTrie {
  constructor() {
    this.hijos = {};
    this.esFinDePalabra = false;
    this.frecuencia = 0;
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
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + costo
      );
    }
  }
  return dp[m][n];
}

// ============================================
// MOTOR DE AUTOCORRECCIÓN
// ============================================

export class Autocorrector {
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
      // === NÚMEROS ===
      'uno','dos','tres','cuatro','cinco','seis','siete','ocho',
      'nueve','diez','cien','mil','primero','segundo','tercero',
      // === ADJETIVOS ===
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
      // === OBJETOS ===
      'telefono','computadora','mesa','silla','cama','puerta',
      'ventana','libro','papel','lapiz','bolsa','llave','ropa',
      'zapato','camisa','pantalon','vestido','reloj','dinero',
      'carro','auto','bus','tren','avion','bicicleta',
      // === EMOCIONES ===
      'amor','miedo','alegria','tristeza','dolor','hambre','sed',
      'sueno','fuerza','salud','problema','solucion','pregunta',
      'respuesta','idea','verdad','mentira','error','ayuda',
      // === NATURALEZA ===
      'sol','luna','agua','fuego','tierra','aire','cielo','mar',
      'rio','montana','arbol','flor','animal','perro','gato',
      'pajaro','lluvia','viento','nube',
      // === COMUNICACIÓN ===
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
      // === FRASES ÚTILES ===
      'bano','medico','policia','emergencia','peligro','cuidado',
      'rapido','silencio','atencion','informacion'
    ];

    this.palabras = diccionario;
    diccionario.forEach(p => this.trie.insertar(p));
  }

  obtenerSugerencias(prefijo, max = 3) {
    if (!prefijo || prefijo.length < 2) return [];
    const pref = prefijo.toLowerCase();

    const porPrefijo = this.trie.sugerir(pref, max);
    if (porPrefijo.length >= max) return porPrefijo.slice(0, max);

    const fuzzy = [];
    const maxDist = pref.length <= 3 ? 1 : 2;

    for (const palabra of this.palabras) {
      if (porPrefijo.includes(palabra)) continue;
      if (Math.abs(palabra.length - pref.length) > maxDist + 1) continue;
      const dist = levenshtein(pref, palabra.substring(0, pref.length));
      if (dist <= maxDist) {
        fuzzy.push({ palabra, dist });
      }
    }

    fuzzy.sort((a, b) => a.dist - b.dist);
    const combinadas = [...porPrefijo, ...fuzzy.map(f => f.palabra)];
    return [...new Set(combinadas)].slice(0, max);
  }

  corregir(palabra) {
    if (!palabra || palabra.length < 2) return null;
    const p = palabra.toLowerCase();

    const exactas = this.trie.sugerir(p, 1);
    if (exactas.length > 0 && exactas[0] === p) return null;

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
