/*
 * djc-core-progreso (v1): el progreso del lector en todo el sitio.
 * XP, racha de días, dominio de 0 a 100 por categoría y por tutorial, y el
 * historial de cada pregunta para el repaso. Ver docs/preguntas.md.
 *
 * Se guarda en localStorage (clave djc-core-progreso-1), solo en este
 * navegador. Si no se puede guardar (modo privado), funciona en memoria.
 *
 * API: window.DjcCoreProgreso
 *   seccion(dificultad)              'basico' | 'intermedio' | 'avanzado'
 *   nivelIngles(dificultad)          'A1' ... 'C2'
 *   xpPorAcierto(dificultad, repaso) XP de un acierto
 *   nivel(xp)                        nivel global (cada 100 XP)
 *   datos()                          copia del progreso
 *   dominio(ambito)                  0 a 100; ambito: 'c:<categoria>' o 't:<tutorial>'
 *   racha()                          días seguidos (0 si ya se cortó)
 *   pregunta(id)                     { a, f, u } o null
 *   responder({ id, dificultad, acierto, ambitos })  registra una respuesta a la primera
 *   sumarXP(n)
 *   terminarReto(clave, estrellas)   suma la racha del día y guarda las estrellas
 *   falladas(ids)                    de esos ids, los más fallados primero
 */
(function () {
  'use strict';

  if (window.DjcCoreProgreso) return;

  var CLAVE = 'djc-core-progreso-1';
  var CLAVE_INGLES = 'djc-english-reto-1';
  var XP_POR_NIVEL = 100;
  var K = 8;        /* cuánto se mueve el dominio en cada respuesta */
  var K_INICIO = 20; /* en las primeras respuestas se mueve más, para llegar rápido al nivel real */
  var RESPUESTAS_INICIO = 10;
  var MARGEN = 10;  /* acertar una pregunta de dificultad d no sube el dominio más allá de d + 10 */
  var ESCALA = 25;  /* qué tan rápido cambia lo esperado con la diferencia */

  function hoy(desfase) {
    var d = new Date();
    if (desfase) d.setDate(d.getDate() + desfase);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function vacio() {
    return { xp: 0, racha: 0, ultimoDia: '', preguntas: {}, dominio: {}, respuestas: {}, retos: {} };
  }

  function objeto(x) {
    return x && typeof x === 'object' && !Array.isArray(x) ? x : {};
  }

  function normalizar(d) {
    var v = vacio();
    if (!d || typeof d !== 'object') return v;
    v.xp = Math.max(0, Number(d.xp) || 0);
    v.racha = Math.max(0, Number(d.racha) || 0);
    v.ultimoDia = String(d.ultimoDia || '');
    v.preguntas = objeto(d.preguntas);
    v.dominio = objeto(d.dominio);
    v.respuestas = objeto(d.respuestas);
    v.retos = objeto(d.retos);
    return v;
  }

  var memoria = null;

  function leer() {
    try {
      var crudo = localStorage.getItem(CLAVE);
      if (crudo) return normalizar(JSON.parse(crudo));
      /* Primera vez: trae el XP y la racha del reto de inglés anterior. */
      var viejo = localStorage.getItem(CLAVE_INGLES);
      if (viejo) {
        var v = JSON.parse(viejo) || {};
        var nuevo = vacio();
        nuevo.xp = Math.max(0, Number(v.xp) || 0);
        nuevo.racha = Math.max(0, Number(v.racha) || 0);
        nuevo.ultimoDia = String(v.ultimoDia || '');
        localStorage.setItem(CLAVE, JSON.stringify(nuevo));
        localStorage.removeItem(CLAVE_INGLES);
        return nuevo;
      }
    } catch (e) {
      if (memoria) return normalizar(memoria);
    }
    return memoria ? normalizar(memoria) : vacio();
  }

  function guardar(d) {
    memoria = d;
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* queda en memoria */ }
  }

  function seccion(dificultad) {
    var x = Number(dificultad) || 0;
    if (x <= 33) return 'basico';
    if (x <= 66) return 'intermedio';
    return 'avanzado';
  }

  function nivelIngles(dificultad) {
    var x = Number(dificultad) || 0;
    if (x <= 16) return 'A1';
    if (x <= 33) return 'A2';
    if (x <= 50) return 'B1';
    if (x <= 66) return 'B2';
    if (x <= 83) return 'C1';
    return 'C2';
  }

  function xpPorAcierto(dificultad, repaso) {
    var base = 1 + Math.round((Number(dificultad) || 0) / 10);
    return repaso ? Math.max(1, Math.floor(base / 2)) : base;
  }

  function nivel(xp) {
    return Math.floor((Number(xp) || 0) / XP_POR_NIVEL) + 1;
  }

  function rachaDe(d) {
    return d.ultimoDia === hoy() || d.ultimoDia === hoy(-1) ? d.racha : 0;
  }

  function limitar(x) {
    return Math.max(0, Math.min(100, x));
  }

  function responder(r) {
    var d = leer();
    var acierto = r.acierto ? 1 : 0;
    var dif = Number(r.dificultad) || 0;
    var p = objeto(d.preguntas[r.id]);
    d.preguntas[r.id] = { a: (p.a || 0) + acierto, f: (p.f || 0) + (1 - acierto), u: hoy() };
    (r.ambitos || []).forEach(function (ambito) {
      var actual = Number(d.dominio[ambito]) || 0;
      var n = Number(d.respuestas[ambito]) || 0;
      var k = n < RESPUESTAS_INICIO ? K_INICIO : K;
      var esperado = 1 / (1 + Math.pow(10, (dif - actual) / ESCALA));
      var nuevo = actual + k * (acierto - esperado);
      /* Acertar algo fácil no te lleva a un nivel alto, ni fallar algo difícil a uno bajo. */
      if (acierto) nuevo = Math.min(nuevo, Math.max(actual, dif + MARGEN));
      else nuevo = Math.max(nuevo, Math.min(actual, dif - MARGEN));
      d.dominio[ambito] = Math.round(limitar(nuevo) * 10) / 10;
      d.respuestas[ambito] = n + 1;
    });
    guardar(d);
  }

  function sumarXP(n) {
    var d = leer();
    var antes = nivel(d.xp);
    d.xp += Math.max(0, Math.round(Number(n) || 0));
    guardar(d);
    return { xp: d.xp, nivel: nivel(d.xp), subio: nivel(d.xp) > antes };
  }

  function terminarReto(clave, estrellas) {
    var d = leer();
    if (d.ultimoDia !== hoy()) {
      d.racha = d.ultimoDia === hoy(-1) ? d.racha + 1 : 1;
      d.ultimoDia = hoy();
    }
    var previo = Number(d.retos[clave]) || 0;
    d.retos[clave] = Math.max(previo, estrellas);
    guardar(d);
    return { racha: d.racha, record: estrellas > previo && previo > 0, mejor: d.retos[clave] };
  }

  function falladas(ids) {
    var d = leer();
    return ids
      .map(function (id) { var p = objeto(d.preguntas[id]); return { id: id, f: p.f || 0, a: p.a || 0 }; })
      .filter(function (x) { return x.f > 0 && x.f >= x.a; })
      .sort(function (x, y) { return (y.f - y.a) - (x.f - x.a) || y.f - x.f; })
      .map(function (x) { return x.id; });
  }

  window.DjcCoreProgreso = {
    seccion: seccion,
    nivelIngles: nivelIngles,
    xpPorAcierto: xpPorAcierto,
    nivel: nivel,
    datos: function () { return JSON.parse(JSON.stringify(leer())); },
    dominio: function (ambito) { return Math.round(Number(leer().dominio[ambito]) || 0); },
    racha: function () { return rachaDe(leer()); },
    pregunta: function (id) { var p = leer().preguntas[id]; return p ? JSON.parse(JSON.stringify(p)) : null; },
    mejorReto: function (clave) { return Number(leer().retos[clave]) || 0; },
    responder: responder,
    sumarXP: sumarXP,
    terminarReto: terminarReto,
    falladas: falladas
  };
})();
