/*
 * djc-english-voz (v1): audio de frases en inglés con acento US o UK y
 * reconocimiento de voz, usando solo las APIs del navegador.
 *
 * Automático: en las tablas con la clase "djc-english-voz-frases", cada celda
 * con lang="en" recibe un botón 🔊. Si la celda trae líneas de IPA
 *   <span class="djc-english-voz-ipa" data-djc-english-voz-acento="us|uk">
 * pone un botón en cada línea, con la voz de ese acento.
 *
 * API para otros componentes: window.DjcEnglishVoz
 *   disponible                     true si el navegador puede leer en voz alta
 *   decir(texto, opciones)         opciones: { lento, acento: 'us'|'uk', boton }
 *   boton(texto, opciones)         botón 🔊; opciones: { acento, etiqueta, clase }
 *   botonLento(texto, opciones)    botón "🐢 lento"
 *   cancelar()
 *   reconoce                       true si el navegador reconoce voz
 *   escuchar(opciones)             { alResultado(alternativas), alError(codigo), alTerminar() }
 *                                  devuelve un objeto con detener() y abortar()
 *   parecido(dicho, esperado)      de 0 a 1: qué parte de la frase esperada se dijo
 */
(function () {
  'use strict';

  if (window.DjcEnglishVoz) return;

  var P = 'djc-english-voz';
  var sintesis = window.speechSynthesis || null;
  var Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var ACENTOS = { us: 'en-us', uk: 'en-gb' };

  /* Textos de los botones según el idioma de la página (<html lang>). */
  var TEXTOS = {
    es: { escuchar: 'Escuchar', lento: 'Escuchar más lento', lentoBtn: '🐢 lento', en: 'Escuchar en {a}: {t}', us: 'inglés de Estados Unidos', uk: 'inglés del Reino Unido' },
    en: { escuchar: 'Listen', lento: 'Listen more slowly', lentoBtn: '🐢 slow', en: 'Listen in {a}: {t}', us: 'American English', uk: 'British English' },
    'zh-cn': { escuchar: '收听', lento: '放慢收听', lentoBtn: '🐢 慢速', en: '收听{a}：{t}', us: '美式英语', uk: '英式英语' }
  };
  var L = (document.documentElement.lang || 'es').toLowerCase();
  var T = TEXTOS[L.indexOf('zh') === 0 ? 'zh-cn' : L.indexOf('en') === 0 ? 'en' : 'es'];

  /* Busca una voz del acento pedido; si no hay, cualquier voz en inglés. */
  function voz(acento) {
    if (!sintesis) return null;
    var buscado = ACENTOS[acento] || ACENTOS.us;
    var voces = sintesis.getVoices();
    var exacta = null;
    var ingles = null;
    for (var i = 0; i < voces.length; i++) {
      var lang = (voces[i].lang || '').toLowerCase().replace('_', '-');
      if (lang === buscado && (!exacta || voces[i].localService)) exacta = voces[i];
      else if (!ingles && lang.indexOf('en') === 0) ingles = voces[i];
    }
    return exacta || ingles;
  }

  if (sintesis) sintesis.getVoices(); /* algunos navegadores cargan las voces al pedirlas */

  function decir(texto, opciones) {
    if (!sintesis) return;
    var o = opciones || {};
    sintesis.cancel();
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = o.acento === 'uk' ? 'en-GB' : 'en-US';
    var v = voz(o.acento);
    if (v) u.voice = v;
    u.rate = o.lento ? 0.6 : 0.9;
    if (o.boton) {
      var b = o.boton;
      b.classList.add(P + '-sonando');
      u.onend = u.onerror = function () { b.classList.remove(P + '-sonando'); };
    }
    sintesis.speak(u);
  }

  function cancelar() {
    if (sintesis) sintesis.cancel();
  }

  function crearBoton(clases, etiqueta, texto, alClic) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = clases;
    b.setAttribute('aria-label', etiqueta);
    b.title = etiqueta;
    b.textContent = texto;
    b.addEventListener('click', alClic);
    return b;
  }

  function boton(texto, opciones) {
    var o = opciones || {};
    return crearBoton(P + '-btn' + (o.clase ? ' ' + o.clase : ''), o.etiqueta || T.escuchar, '🔊', function (e) {
      decir(texto, { acento: o.acento, boton: e.currentTarget });
    });
  }

  function botonLento(texto, opciones) {
    var o = opciones || {};
    return crearBoton(P + '-btn ' + P + '-btn-lento', T.lento, T.lentoBtn, function (e) {
      decir(texto, { lento: true, acento: o.acento, boton: e.currentTarget });
    });
  }

  /* ---------- Reconocimiento de voz ---------- */

  function escuchar(opciones) {
    var o = opciones || {};
    var r = new Reconocedor();
    r.lang = o.acento === 'uk' ? 'en-GB' : 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = function (e) {
      var lista = [];
      for (var i = 0; i < e.results[0].length; i++) lista.push(e.results[0][i].transcript);
      if (o.alResultado) o.alResultado(lista);
    };
    r.onerror = function (e) { if (o.alError) o.alError(e.error); };
    r.onend = function () { if (o.alTerminar) o.alTerminar(); };
    try { r.start(); } catch (err) { if (o.alTerminar) o.alTerminar(); }
    return {
      detener: function () { try { r.stop(); } catch (e) { /* ya terminó */ } },
      abortar: function () { try { r.abort(); } catch (e) { /* ya terminó */ } }
    };
  }

  var CONTRACCIONES = {
    "i'm": 'i am', "you're": 'you are', "what's": 'what is', "it's": 'it is',
    "he's": 'he is', "she's": 'she is', "we're": 'we are', "they're": 'they are',
    "that's": 'that is', "where's": 'where is', "how's": 'how is', "don't": 'do not'
  };

  function palabras(texto) {
    return String(texto || '').toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(function (p) { return CONTRACCIONES[p] || p; })
      .join(' ')
      .split(' ')
      .filter(Boolean);
  }

  function parecido(dicho, esperado) {
    var d = palabras(dicho);
    var e = palabras(esperado);
    var encontradas = 0;
    e.forEach(function (p) {
      var i = d.indexOf(p);
      if (i !== -1) { encontradas++; d.splice(i, 1); }
    });
    return e.length ? encontradas / e.length : 0;
  }

  /* ---------- Tablas de frases ---------- */

  function prepararTablas() {
    if (!sintesis) return;
    document.querySelectorAll('table.' + P + '-frases td[lang="en"]').forEach(function (td) {
      if (td.hasAttribute('data-' + P + '-listo')) return;
      td.setAttribute('data-' + P + '-listo', '');
      var frase = td.querySelector('strong') || td;
      var texto = frase.textContent.trim();
      if (!texto) return;
      var lineas = td.querySelectorAll('.' + P + '-ipa[data-' + P + '-acento]');
      if (!lineas.length) {
        td.appendChild(boton(texto, { etiqueta: T.escuchar + ': ' + texto }));
        return;
      }
      lineas.forEach(function (linea) {
        var acento = linea.getAttribute('data-' + P + '-acento');
        var nombre = acento === 'uk' ? T.uk : T.us;
        linea.insertBefore(boton(texto, { acento: acento, etiqueta: T.en.replace('{a}', nombre).replace('{t}', texto) }), linea.firstChild);
      });
    });
  }

  window.DjcEnglishVoz = {
    disponible: !!sintesis,
    decir: decir,
    boton: boton,
    botonLento: botonLento,
    cancelar: cancelar,
    reconoce: !!Reconocedor,
    escuchar: escuchar,
    parecido: parecido,
    palabras: palabras
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepararTablas);
  else prepararTablas();
})();
