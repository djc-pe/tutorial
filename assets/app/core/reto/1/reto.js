/*
 * djc-core-reto (v1): retos y tests con el banco de preguntas.
 * Ver docs/preguntas.md. Necesita djc-core-progreso (cargarlo antes); usa
 * djc-english-voz si la página lo carga (para "oir" y "hablar").
 *
 * Mini reto de una sección de un tutorial:
 *   <div class="djc-core-reto" data-djc-core-reto-tutorial="<id>"
 *        data-djc-core-reto-seccion="basico|intermedio|avanzado"></div>
 *   Opcionales: data-djc-core-reto-titulo="Reto de la lección 1" y
 *   data-djc-core-reto-preguntas="10" (por defecto 5).
 *
 * Test de una categoría:
 *   <div class="djc-core-reto" data-djc-core-reto-categoria="devops"></div>
 *
 * El banco se busca en <raíz del sitio>/preguntas/, calculada desde la
 * ubicación de este archivo (assets/app/core/reto/1/reto.js).
 */
(function () {
  'use strict';

  var P = 'djc-core-reto';
  var ACTUAL = document.currentScript;
  var RAIZ = new URL('../../../../../', ACTUAL ? ACTUAL.src : location.href);
  var POR_SECCION = 5;
  var POR_TEST = 10;
  var MINIMO_MODO = 3;
  var XP_FINAL = 5;
  var ABIERTO = null; /* el reto que está en pantalla completa, si hay uno */

  var Progreso = window.DjcCoreProgreso;
  var Voz = window.DjcEnglishVoz || null;

  /* ---------- Textos ---------- */

  var TEXTOS = {
    es: {
      secciones: { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' },
      retoSeccion: 'Reto: {s}',
      testCategoria: 'Test de {c}',
      preguntas: '{n} preguntas',
      preguntas1: '1 pregunta',
      subReto: '{n} preguntas de esta sección. Lo que falles vuelve al final.',
      subReto1: 'Una pregunta de esta sección.',
      subTest: 'Elige cómo quieres practicar. Son {n} preguntas de todos los tutoriales de la categoría.',
      empezar: 'Empezar el reto',
      otraVez: 'Jugar otra vez',
      cambiarModo: 'Elegir otro modo',
      miNivel: 'Mi nivel',
      miNivelSub: 'Se adapta a ti',
      repaso: 'Repaso',
      repasoSub: 'Lo que más fallaste',
      nivel: 'Nivel', xp: 'XP', dias1: 'día seguido', dias: 'días seguidos',
      mejor: 'Tu mejor marca',
      dominio: '{a}: {n}, {s}',
      tuDominio: 'Tu dominio',
      elige: 'Elige',
      escuchaElige: 'Escucha y elige',
      marcaTodas: 'Marca todas las correctas',
      eligeN: 'Elige {n}',
      ordena: 'Ordena',
      dilo: 'Dilo en voz alta',
      otraVezTag: 'Otra vez',
      comprobar: 'Comprobar',
      continuar: 'Continuar',
      salir: 'Salir del reto',
      salirPregunta: '¿Salir del reto? Perderás esta ronda.',
      salirSi: 'Salir',
      seguir: 'Seguir jugando',
      volver: 'Volver',
      bien: ['Bien hecho.', 'Correcto.', 'Eso es.', 'Muy bien.'],
      mal: 'No pasa nada, aprendemos de esto.',
      malHablar: 'Casi. Escúchala y vuelve a intentarlo al final.',
      respuestaEs: 'La respuesta es:',
      repasa: 'Repasa: {t}, sección {s}',
      terminado: 'Reto terminado',
      estrellas: '{n} de 3 estrellas',
      final3: 'Perfecto. Esto ya es tuyo.',
      final2: 'Muy bien. Repite el reto para conseguir las 3 estrellas.',
      final1: 'Buen comienzo. Repasa la sección y vuelve a intentarlo.',
      aciertos: 'Acertaste {a} de {t} a la primera.',
      record: 'Nueva mejor marca.',
      compartir: 'Compartir',
      copiado: 'Copiado. Pégalo donde quieras.',
      textoCompartir: '{r}: {e}\n🔥 {d} aprendiendo en DJC Tutorial\n{u}',
      guardado: 'Tu progreso se guarda solo en este navegador.',
      error: 'No se pudieron cargar las preguntas. Revisa tu conexión y recarga la página.',
      hablar: '🎙️ Hablar', hablarOtra: '🎙️ Otra vez', escuchando: '⏺ Escuchando…',
      tocaMic: 'Toca el micrófono y di la frase.', hablaAhora: 'Habla ahora.',
      teEntendi: 'Te entendí: "{t}"', noPermiso: 'No tengo permiso para usar el micrófono. Puedes saltar esta pregunta.',
      noTeEscuche: 'No te escuché. Inténtalo otra vez, un poco más fuerte.', noPude: 'No pude escucharte. Inténtalo otra vez o salta esta pregunta.',
      saltar: 'Ahora no puedo hablar', respuesta: 'Tu respuesta', palabras: 'Palabras'
    },
    en: {
      secciones: { basico: 'Basic', intermedio: 'Intermediate', avanzado: 'Advanced' },
      retoSeccion: 'Challenge: {s}',
      testCategoria: '{c} test',
      preguntas: '{n} questions',
      preguntas1: '1 question',
      subReto: '{n} questions from this section. What you miss comes back at the end.',
      subReto1: 'One question from this section.',
      subTest: 'Choose how you want to practice. {n} questions from every tutorial in the category.',
      empezar: 'Start the challenge',
      otraVez: 'Play again',
      cambiarModo: 'Choose another mode',
      miNivel: 'My level',
      miNivelSub: 'Adapts to you',
      repaso: 'Review',
      repasoSub: 'What you missed most',
      nivel: 'Level', xp: 'XP', dias1: 'day streak', dias: 'day streak',
      mejor: 'Your best',
      dominio: '{a}: {n}, {s}',
      tuDominio: 'Your mastery',
      elige: 'Choose',
      escuchaElige: 'Listen and choose',
      marcaTodas: 'Select all the correct answers',
      eligeN: 'Choose {n}',
      ordena: 'Put in order',
      dilo: 'Say it out loud',
      otraVezTag: 'Again',
      comprobar: 'Check',
      continuar: 'Continue',
      salir: 'Leave the challenge',
      salirPregunta: 'Leave the challenge? You will lose this round.',
      salirSi: 'Leave',
      seguir: 'Keep playing',
      volver: 'Back',
      bien: ['Well done.', 'Correct.', 'That is it.', 'Very good.'],
      mal: 'No problem, we learn from this.',
      malHablar: 'Almost. Listen to it and try again at the end.',
      respuestaEs: 'The answer is:',
      repasa: 'Review: {t}, {s} section',
      terminado: 'Challenge complete',
      estrellas: '{n} of 3 stars',
      final3: 'Perfect. You own this now.',
      final2: 'Very good. Play again to get all 3 stars.',
      final1: 'Good start. Review the section and try again.',
      aciertos: 'You got {a} of {t} right on the first try.',
      record: 'New personal best.',
      compartir: 'Share',
      copiado: 'Copied. Paste it anywhere.',
      textoCompartir: '{r}: {e}\n🔥 {d} learning on DJC Tutorial\n{u}',
      guardado: 'Your progress is saved only in this browser.',
      error: 'The questions could not be loaded. Check your connection and reload the page.',
      hablar: '🎙️ Speak', hablarOtra: '🎙️ Again', escuchando: '⏺ Listening…',
      tocaMic: 'Tap the microphone and say the sentence.', hablaAhora: 'Speak now.',
      teEntendi: 'I heard: "{t}"', noPermiso: 'I am not allowed to use the microphone. You can skip this question.',
      noTeEscuche: 'I did not hear you. Try again, a little louder.', noPude: 'I could not hear you. Try again or skip this question.',
      saltar: 'I cannot speak right now', respuesta: 'Your answer', palabras: 'Words'
    },
    'zh-cn': {
      secciones: { basico: '基础', intermedio: '中级', avanzado: '高级' },
      retoSeccion: '挑战：{s}',
      testCategoria: '{c}测试',
      preguntas: '{n} 道题',
      subReto: '本节的 {n} 道题。答错的题会在最后再出现。',
      subTest: '选择练习方式。共 {n} 道题，来自本分类的所有教程。',
      empezar: '开始挑战',
      otraVez: '再玩一次',
      cambiarModo: '换一种模式',
      miNivel: '我的水平',
      miNivelSub: '根据你调整',
      repaso: '复习',
      repasoSub: '你错得最多的题',
      nivel: '等级', xp: 'XP', dias1: '天连续', dias: '天连续',
      mejor: '最佳成绩',
      dominio: '{a}：{n}，{s}',
      tuDominio: '你的掌握度',
      elige: '选择',
      escuchaElige: '听一听，选一选',
      marcaTodas: '选出所有正确答案',
      eligeN: '选 {n} 个',
      ordena: '排序',
      dilo: '大声说出来',
      otraVezTag: '再来一次',
      comprobar: '检查',
      continuar: '继续',
      salir: '退出挑战',
      salirPregunta: '要退出挑战吗？这一轮的进度会丢失。',
      salirSi: '退出',
      seguir: '继续答题',
      volver: '返回',
      bien: ['做得好。', '正确。', '就是这样。', '很好。'],
      mal: '没关系，我们从错误中学习。',
      malHablar: '差一点。听一遍，最后再试一次。',
      respuestaEs: '答案是：',
      repasa: '复习：{t}，{s}部分',
      terminado: '挑战完成',
      estrellas: '3 颗星中的 {n} 颗',
      final3: '完美。你已经掌握了。',
      final2: '很好。再玩一次，拿到 3 颗星。',
      final1: '不错的开始。复习这一节，再试一次。',
      aciertos: '第一次就答对了 {t} 道中的 {a} 道。',
      record: '新的最佳成绩。',
      compartir: '分享',
      copiado: '已复制，可以粘贴到任何地方。',
      textoCompartir: '{r}：{e}\n🔥 在 DJC Tutorial 学习 {d}\n{u}',
      guardado: '你的进度只保存在这个浏览器中。',
      error: '无法加载题目。请检查网络并刷新页面。',
      hablar: '🎙️ 说话', hablarOtra: '🎙️ 再说一次', escuchando: '⏺ 正在听…',
      tocaMic: '点击麦克风，说出这句话。', hablaAhora: '现在请说。',
      teEntendi: '我听到的是："{t}"', noPermiso: '没有使用麦克风的权限。你可以跳过这道题。',
      noTeEscuche: '没有听到你的声音。再试一次，大声一点。', noPude: '听不到你的声音。再试一次或跳过这道题。',
      saltar: '现在不方便说话', respuesta: '你的答案', palabras: '单词'
    }
  };

  function idioma() {
    var l = (document.documentElement.lang || 'es').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh-cn';
    if (l.indexOf('en') === 0) return 'en';
    return 'es';
  }

  var LANG = idioma();
  var T = TEXTOS[LANG];

  function f(plantilla, datos) {
    return String(plantilla).replace(/\{(\w+)\}/g, function (_, k) { return datos && k in datos ? datos[k] : ''; });
  }

  /* Usa la forma en singular (clave + "1") cuando n es 1 y existe. */
  function fn(clave, n) {
    return f(n === 1 && T[clave + '1'] ? T[clave + '1'] : T[clave], { n: n });
  }

  function dias(n) {
    return n + ' ' + (n === 1 ? T.dias1 : T.dias);
  }

  /* ---------- Utilidades ---------- */

  function el(etiqueta, attrs, hijos) {
    var n = document.createElement(etiqueta);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'texto') n.textContent = v;
        else if (k === 'clase') n.className = v;
        else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      }
    }
    (hijos || []).forEach(function (h) {
      if (h === null || h === undefined) return;
      n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
    });
    return n;
  }

  /* c('btn') → "djc-core-reto-btn"; c('btn', 'sec') → "djc-core-reto-btn djc-core-reto-sec" */
  function c() {
    return Array.prototype.map.call(arguments, function (x) { return P + '-' + x; }).join(' ');
  }

  function mezclar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function porDificultad(a, b) { return a.dificultad - b.dificultad; }

  /* Hasta n preguntas repartidas entre la más fácil y la más difícil. */
  function repartir(lista, n) {
    var orden = lista.slice().sort(porDificultad);
    if (orden.length <= n) return orden;
    var elegidas = [];
    for (var i = 0; i < n; i++) {
      var desde = Math.floor(i * orden.length / n);
      var hasta = Math.floor((i + 1) * orden.length / n);
      elegidas.push(orden[desde + Math.floor(Math.random() * (hasta - desde))]);
    }
    return elegidas;
  }

  function palabras(texto) {
    if (Voz) return Voz.palabras(texto);
    return String(texto || '').toLowerCase().replace(/[^a-z0-9'_\-./: ]+/g, ' ').split(/\s+/).filter(Boolean);
  }

  function evento(nombre, datos) {
    try { if (typeof window.gtag === 'function') window.gtag('event', 'djc_core_reto_' + nombre, datos); } catch (e) { /* sin analítica */ }
  }

  function cargar(ruta) {
    return fetch(new URL(ruta, RAIZ).href, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + ruta);
      return r.json();
    });
  }

  /* Deja solo las preguntas usables en este idioma y navegador. */
  function preparar(archivo, extra) {
    return (archivo.preguntas || []).filter(function (q) {
      if (q.retirada || !q[LANG]) return false;
      if (q.tipo === 'hablar' && !(Voz && Voz.reconoce)) return false;
      return true;
    }).map(function (q) {
      return {
        id: q.id,
        dificultad: Number(q.dificultad) || 0,
        tipo: q.tipo || 'elegir',
        oir: !!(q.oir && Voz && Voz.disponible),
        elige: !!q.elige,
        opcionesEn: !!q.opcionesEn,
        opcionesCodigo: !!q.opcionesCodigo, /* opciones que son código o salidas de consola */
        contexto: q.contexto !== false, /* si falta, se trata como que necesita el tutorial */
        t: q[LANG],
        tutorial: archivo.tutorial,
        categorias: archivo.categorias || [],
        origen: extra || null
      };
    });
  }

  /* ---------- Un reto ---------- */

  function Reto(caja) {
    this.caja = caja;
    this.tutorial = caja.getAttribute('data-' + P + '-tutorial');
    this.seccion = caja.getAttribute('data-' + P + '-seccion');
    this.categoria = caja.getAttribute('data-' + P + '-categoria');
    this.tituloPropio = caja.getAttribute('data-' + P + '-titulo');
    this.cantidad = Math.max(1, parseInt(caja.getAttribute('data-' + P + '-preguntas'), 10) || POR_SECCION);
    this.inicial = el('div', { 'aria-live': 'polite' });
    caja.appendChild(this.inicial);
    this.vista = this.inicial;  /* dónde se dibuja: la tarjeta de la página o el modal */
    var self = this;
    this.cargar().then(function () { self.inicio(); }, function (e) {
      self.vista.textContent = '';
      self.vista.appendChild(el('p', { clase: c('aviso'), texto: T.error }));
      if (window.console) console.warn(P, e);
    });
  }

  Reto.prototype.cargar = function () {
    var self = this;
    if (this.categoria) {
      return cargar('preguntas/c/' + this.categoria + '.json').then(function (indice) {
        self.indice = indice;
        self.nombre = (indice.titulo && (indice.titulo[LANG] || indice.titulo.es)) || self.categoria;
        var tutoriales = {};
        return Promise.all((indice.tutoriales || []).map(function (t) {
          tutoriales[t.tutorial] = t;
          /* Fuera del tutorial solo van las que se entienden solas (contexto: false). */
          return cargar(t.archivo).then(function (archivo) {
            return preparar(archivo, t).filter(function (q) { return !q.contexto; });
          }, function () { return []; });
        })).then(function (listas) {
          self.banco = [].concat.apply([], listas);
          self.tutoriales = tutoriales;
        });
      });
    }
    return cargar('preguntas/t/' + this.tutorial + '.json').then(function (archivo) {
      self.escala = archivo.escala || 'secciones';
      var todas = preparar(archivo);
      self.banco = todas.filter(function (q) { return Progreso.seccion(q.dificultad) === self.seccion; });
    });
  };

  Reto.prototype.ambitos = function (q) {
    return ['t:' + q.tutorial].concat(q.categorias.map(function (x) { return 'c:' + x; }));
  };

  Reto.prototype.ambitoPrincipal = function () {
    return this.categoria ? 'c:' + this.categoria : 't:' + this.tutorial;
  };

  Reto.prototype.clave = function () {
    return this.categoria ? 'c:' + this.categoria + ':' + this.modo : 't:' + this.tutorial + ':' + this.seccion;
  };

  Reto.prototype.titulo = function () {
    if (!this.categoria && this.tituloPropio) return this.tituloPropio;
    if (!this.categoria) return f(T.retoSeccion, { s: T.secciones[this.seccion] || this.seccion });
    var base = f(T.testCategoria, { c: this.nombre });
    if (!this.modo) return base;
    var modo = this.modo === 'nivel' ? T.miNivel : this.modo === 'repaso' ? T.repaso : T.secciones[this.modo];
    return base + ': ' + modo;
  };

  Reto.prototype.limpiar = function () {
    if (this.escucha) { this.escucha.abortar(); this.escucha = null; }
    if (Voz) Voz.cancelar();
    this.vista.textContent = '';
    if (this.modal) { this.cabeza.textContent = ''; this.pie.textContent = ''; }
  };

  /* ---------- Pantalla completa ---------- */

  Reto.prototype.abrir = function () {
    var self = this;
    if (this.modal) return;
    this.cabeza = el('div', { clase: c('cabeza') });
    this.contenido = el('div', { clase: c('contenido'), 'aria-live': 'polite' });
    this.pie = el('div', { clase: c('pie') });
    this.modal = el('div', {
      clase: P + ' ' + c('modal'),
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': this.titulo()
    }, [el('div', { clase: c('marco') }, [this.cabeza, this.contenido, this.pie])]);
    this.modal.setAttribute('data-' + P + '-listo', '');
    this.volverA = document.activeElement;
    document.body.appendChild(this.modal);
    document.documentElement.classList.add(c('abierto'));
    this.vista = this.contenido;
    ABIERTO = this;

    /* El botón "atrás" del celular cierra el reto en vez de salir de la página. */
    try { history.pushState({ djcCoreReto: true }, ''); this.historial = true; } catch (e) { this.historial = false; }

    this.teclas = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.salir(); return; }
      if (e.key !== 'Tab') return;
      var focos = Array.prototype.filter.call(self.modal.querySelectorAll('button, a[href], [tabindex]'), function (x) {
        return !x.disabled && x.offsetParent !== null;
      });
      if (!focos.length) return;
      var primero = focos[0];
      var ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      else if (!self.modal.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener('keydown', this.teclas);
  };

  /* Cierra el modal y vuelve a la tarjeta de la página, en el mismo lugar. */
  Reto.prototype.cerrar = function (desdeHistorial) {
    if (!this.modal) return;
    if (!desdeHistorial && this.historial) {
      this.historial = false;
      history.back(); /* el popstate termina de cerrar */
      return;
    }
    this.historial = false;
    if (this.escucha) { this.escucha.abortar(); this.escucha = null; }
    if (Voz) Voz.cancelar();
    document.removeEventListener('keydown', this.teclas);
    this.modal.remove();
    this.modal = null;
    document.documentElement.classList.remove(c('abierto'));
    ABIERTO = null;
    this.vista = this.inicial;
    this.inicio();
    var foco = this.inicial.querySelector('button') || this.volverA;
    if (foco && foco.focus) foco.focus({ preventScroll: true });
  };

  /* La ✕ o Esc: si ya respondió algo y no terminó, pregunta antes de salir. */
  Reto.prototype.salir = function () {
    var self = this;
    if (!this.modal) return;
    if (!this.jugando || !this.contadas) { this.cerrar(); return; }
    if (this.pie.querySelector('.' + c('confirmar'))) return;
    var antes = Array.prototype.slice.call(this.pie.childNodes);
    this.pie.textContent = '';
    var seguir = el('button', {
      type: 'button',
      clase: c('btn'),
      texto: T.seguir,
      onclick: function () { self.pie.textContent = ''; antes.forEach(function (n) { self.pie.appendChild(n); }); }
    });
    this.pie.appendChild(el('div', { clase: c('confirmar'), role: 'alertdialog', 'aria-label': T.salirPregunta }, [
      el('p', { texto: T.salirPregunta }),
      el('div', { clase: c('acciones') }, [
        seguir,
        el('button', { type: 'button', clase: c('btn-sec'), texto: T.salirSi, onclick: function () { self.jugando = false; self.cerrar(); } })
      ])
    ]));
    seguir.focus();
  };

  Reto.prototype.chips = function (extra) {
    var d = Progreso.datos();
    var racha = Progreso.racha();
    return el('div', { clase: c('chips') }, [
      el('span', { clase: c('chip') }, [T.nivel + ' ', el('strong', { texto: String(Progreso.nivel(d.xp)) })]),
      el('span', { clase: c('chip') }, [el('strong', { texto: String(d.xp) }), ' ' + T.xp]),
      el('span', { clase: c('chip') }, ['🔥 ', el('strong', { texto: String(racha) }), ' ' + (racha === 1 ? T.dias1 : T.dias)])
    ].concat(extra || []));
  };

  Reto.prototype.chipDominio = function () {
    var n = Progreso.dominio(this.ambitoPrincipal());
    /* En idiomas el nivel se dice A1 a C2; en lo demás, básico, intermedio o avanzado. */
    var seccion = this.escala === 'idiomas' ? Progreso.nivelIngles(n) : T.secciones[Progreso.seccion(n)];
    var texto = this.categoria ? f(T.dominio, { a: this.nombre, n: n, s: seccion }) : f(T.dominio, { a: T.tuDominio, n: n, s: seccion });
    return el('span', { clase: c('chip') }, [texto]);
  };

  Reto.prototype.inicio = function () {
    var self = this;
    if (this.modal) { this.cerrar(); return; }
    this.jugando = false;
    this.limpiar();
    this.modo = this.categoria ? null : this.seccion;

    if (!this.banco.length) { this.caja.hidden = true; return; }
    this.caja.hidden = false;

    if (!this.categoria) {
      var mejor = Progreso.mejorReto(this.clave());
      this.vista.appendChild(el('div', null, [
        el('p', { clase: c('titulo'), texto: this.titulo() }),
        el('p', { clase: c('sub'), texto: fn('subReto', Math.min(this.cantidad, this.banco.length)) }),
        this.chips(mejor ? [el('span', { clase: c('chip') }, [T.mejor + ': ', el('strong', { texto: '⭐'.repeat(mejor) })])] : []),
        el('div', { clase: c('acciones') }, [
          el('button', { type: 'button', clase: c('btn'), texto: mejor ? T.otraVez : T.empezar, onclick: function () { self.empezar(self.seccion); } })
        ])
      ]));
      return;
    }

    var cuenta = { basico: 0, intermedio: 0, avanzado: 0 };
    this.banco.forEach(function (q) { cuenta[Progreso.seccion(q.dificultad)]++; });
    var falladas = Progreso.falladas(this.banco.map(function (q) { return q.id; }));

    function modo(id, nombre, sub, activo) {
      var mejor = Progreso.mejorReto('c:' + self.categoria + ':' + id);
      return el('button', {
        type: 'button',
        clase: c('modo'),
        disabled: !activo,
        onclick: function () { self.empezar(id); }
      }, [
        el('span', { clase: c('modo-nombre'), texto: nombre }),
        el('span', { clase: c('modo-sub'), texto: sub + (mejor ? '  ' + '⭐'.repeat(mejor) : '') })
      ]);
    }

    this.vista.appendChild(el('div', null, [
      el('p', { clase: c('titulo'), texto: this.titulo() }),
      el('p', { clase: c('sub'), texto: f(T.subTest, { n: POR_TEST }) }),
      this.chips([this.chipDominio()]),
      el('div', { clase: c('modos') }, [
        modo('basico', T.secciones.basico, fn('preguntas', cuenta.basico), cuenta.basico >= MINIMO_MODO),
        modo('intermedio', T.secciones.intermedio, fn('preguntas', cuenta.intermedio), cuenta.intermedio >= MINIMO_MODO),
        modo('avanzado', T.secciones.avanzado, fn('preguntas', cuenta.avanzado), cuenta.avanzado >= MINIMO_MODO),
        modo('nivel', T.miNivel, T.miNivelSub, this.banco.length >= 5),
        modo('repaso', T.repaso, T.repasoSub, falladas.length >= MINIMO_MODO)
      ])
    ]));
  };

  Reto.prototype.empezar = function (modo) {
    var self = this;
    this.modo = modo;
    this.hechos = 0;
    this.aciertos = 0;
    this.contadas = 0;
    this.xp = 0;
    this.vistas = {};
    this.cola = [];
    this.adaptativo = false;

    if (!this.categoria) {
      this.cola = repartir(this.banco, this.cantidad);
    } else if (modo === 'nivel') {
      this.adaptativo = true;
      this.objetivo = Progreso.dominio(this.ambitoPrincipal()) || 20;
    } else if (modo === 'repaso') {
      var ids = Progreso.falladas(this.banco.map(function (q) { return q.id; })).slice(0, POR_TEST);
      this.cola = this.banco.filter(function (q) { return ids.indexOf(q.id) !== -1; }).sort(porDificultad);
    } else {
      this.cola = mezclar(this.banco.filter(function (q) { return Progreso.seccion(q.dificultad) === modo; }))
        .slice(0, POR_TEST).sort(porDificultad);
    }
    this.cola = this.cola.map(function (q) { return { q: q, repaso: false }; });
    this.total = this.adaptativo ? Math.min(POR_TEST, this.banco.length) : this.cola.length;
    this.abrir();
    this.modal.setAttribute('aria-label', this.titulo());
    this.jugando = true;
    evento('inicio', { reto: self.clave() });
    this.siguiente();
  };

  /* En "Mi nivel": la pregunta no vista más cercana a la dificultad buscada. */
  Reto.prototype.proximaAdaptativa = function () {
    var self = this;
    if (this.contadas >= this.total) return null;
    var libres = this.banco.filter(function (q) { return !self.vistas[q.id]; });
    if (!libres.length) return null;
    libres.sort(function (a, b) { return Math.abs(a.dificultad - self.objetivo) - Math.abs(b.dificultad - self.objetivo); });
    var q = libres[Math.floor(Math.random() * Math.min(3, libres.length))];
    return { q: q, repaso: false };
  };

  Reto.prototype.siguiente = function () {
    this.actual = this.adaptativo ? this.proximaAdaptativa() : this.cola.shift();
    if (!this.actual) { this.final(); return; }
    this.vistas[this.actual.q.id] = true;
    this.mostrar();
  };

  Reto.prototype.pendientes = function () {
    if (this.adaptativo) return this.total;
    var extra = this.cola.filter(function (x) { return x.repaso; }).length + (this.actual && this.actual.repaso ? 1 : 0);
    return this.total + extra;
  };

  Reto.prototype.mostrar = function () {
    var self = this;
    var q = this.actual.q;
    this.limpiar();
    this.revisado = false;

    var avance = Math.round(this.hechos / Math.max(1, this.pendientes()) * 100);

    this.cuerpo = el('div');
    this.respuesta = el('div');
    this.boton = el('button', { type: 'button', clase: c('btn'), texto: T.comprobar, disabled: true, onclick: function () { self.comprobar(); } });
    this.acciones = el('div', { clase: c('acciones') }, [this.boton]);

    this.barra(avance);
    this.vista.appendChild(el('div', null, [
      this.actual.repaso ? el('p', { clase: c('tipo'), texto: T.otraVezTag }) : null,
      this.cuerpo,
      this.respuesta
    ]));
    this.pie.appendChild(this.acciones);
    this.contenido.scrollTop = 0;

    if (q.tipo === 'ordenar') this.ordenar(q);
    else if (q.tipo === 'hablar') this.hablar(q);
    else this.opciones(q);
  };

  /* Arriba del modal: la ✕ y la barra de progreso. */
  Reto.prototype.barra = function (avance) {
    var self = this;
    var relleno = el('div', { clase: c('barra-relleno') });
    relleno.style.width = avance + '%';
    this.cabeza.textContent = '';
    this.cabeza.appendChild(el('div', { clase: c('barra') }, [
      el('button', { type: 'button', clase: c('cerrar'), 'aria-label': T.salir, title: T.salir, texto: '×', onclick: function () { self.salir(); } }),
      el('div', { clase: c('barra-fondo'), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(avance) }, [relleno])
    ]));
  };

  Reto.prototype.encabezado = function (q, tipo) {
    /* En el test de categoría, de qué tutorial viene la pregunta. */
    if (q.origen && q.origen.titulo) {
      var nombre = q.origen.titulo[LANG] || q.origen.titulo.es;
      if (nombre) this.cuerpo.appendChild(el('p', { clase: c('origen'), texto: '📘 ' + nombre }));
    }
    this.cuerpo.appendChild(el('p', { clase: c('tipo'), texto: tipo }));
    this.cuerpo.appendChild(el('p', { clase: c('pregunta'), texto: q.t.pregunta }));
  };

  /* La frase de la pregunta: en inglés con audio, o un comando o log en código. */
  Reto.prototype.frase = function (q) {
    var texto = q.t.frase;
    if (!texto) return;
    if (q.oir) {
      var grande = Voz.boton(texto, { clase: 'djc-english-voz-btn-grande', etiqueta: texto });
      this.cuerpo.appendChild(el('p', { clase: c('frase') }, [grande, Voz.botonLento(texto)]));
      setTimeout(function () { Voz.decir(texto, { boton: grande }); }, 300);
    } else if (Voz) {
      var p = el('p', { clase: c('frase') }, [el('span', { lang: 'en', texto: texto })]);
      if (Voz.disponible) p.appendChild(Voz.boton(texto));
      this.cuerpo.appendChild(p);
    } else {
      this.cuerpo.appendChild(el('pre', { clase: c('codigo') }, [el('code', { texto: texto })]));
    }
  };

  /* Tipos "elegir" (una correcta) y "varias" (todas las correctas). */
  Reto.prototype.opciones = function (q) {
    var self = this;
    var varias = q.tipo === 'varias';
    var correctas = q.t.opciones.filter(function (o) { return o.correcta; }).length;
    var tipo = varias ? (q.elige ? f(T.eligeN, { n: correctas }) : T.marcaTodas) : (q.oir ? T.escuchaElige : T.elige);
    this.encabezado(q, tipo);
    this.frase(q);

    var grupo = el('div', { clase: c('opciones', varias ? 'varias' : 'una'), role: varias ? 'group' : 'radiogroup' });
    var botones = [];
    var marcadas = {};

    mezclar(q.t.opciones.map(function (o, i) { return i; })).forEach(function (i) {
      var o = q.t.opciones[i];
      var b = el('button', {
        type: 'button',
        clase: c('opcion'),
        role: varias ? 'checkbox' : 'radio',
        lang: q.opcionesEn ? 'en' : null,
        'aria-checked': 'false',
        onclick: function () {
          if (self.revisado) return;
          if (!varias) {
            botones.forEach(function (x) { x.b.classList.remove(c('elegida')); x.b.setAttribute('aria-checked', 'false'); });
            marcadas = {};
          }
          marcadas[i] = !marcadas[i];
          b.classList.toggle(c('elegida'), !!marcadas[i]);
          b.setAttribute('aria-checked', marcadas[i] ? 'true' : 'false');
          self.boton.disabled = !Object.keys(marcadas).some(function (k) { return marcadas[k]; });
        }
      }, [
        varias ? el('span', { clase: c('casilla'), 'aria-hidden': 'true' }) : null,
        el(q.opcionesCodigo ? 'pre' : 'span', { clase: c('opcion-texto') + (q.opcionesCodigo ? ' ' + c('opcion-codigo') : ''), texto: o.texto })
      ]);
      botones.push({ b: b, i: i, o: o });
      grupo.appendChild(b);
    });
    this.cuerpo.appendChild(grupo);

    this.revisar = function () {
      var ok = true;
      var notas = [];
      botones.forEach(function (x) {
        var elegida = !!marcadas[x.i];
        var marca = null;
        if (x.o.correcta && elegida) marca = 'ok';
        else if (x.o.correcta && !elegida) { marca = varias ? 'falto' : 'ok'; ok = false; }
        else if (!x.o.correcta && elegida) { marca = 'mal'; ok = false; }
        if (marca) x.b.classList.add(c(marca));
        x.b.disabled = true;
        /* En "varias" se listan todas las que importan; en "elegir", solo las que traen explicación. */
        if (marca && (varias || x.o.explica)) notas.push({ marca: marca, texto: x.o.texto, explica: x.o.explica || '' });
      });
      var buenas = q.t.opciones.filter(function (o) { return o.correcta; }).map(function (o) { return o.texto; });
      /* Si las opciones están en inglés, se escucha la correcta; si no, la frase que se oyó. */
      var decir = q.opcionesEn && buenas.length === 1 ? buenas[0] : (q.oir ? q.t.frase : null);
      return { ok: ok, correcta: buenas.join(' / '), codigo: q.opcionesCodigo, varias: varias, notas: notas, decir: decir };
    };
  };

  /* Tipo "ordenar": tocar las palabras en el orden correcto. */
  Reto.prototype.ordenar = function (q) {
    var self = this;
    this.encabezado(q, T.ordena);
    var linea = el('div', { clase: c('linea'), 'aria-label': T.respuesta });
    var banco = el('div', { clase: c('banco'), 'aria-label': T.palabras });
    if (Voz) { linea.setAttribute('lang', 'en'); banco.setAttribute('lang', 'en'); }
    var elegidas = [];

    function actualizar() { self.boton.disabled = elegidas.length === 0; }

    mezclar(q.t.frase.split(/\s+/).concat(q.t.extra || [])).forEach(function (palabra) {
      var enBanco = el('button', { type: 'button', clase: c('ficha'), texto: palabra });
      enBanco.addEventListener('click', function () {
        if (self.revisado || enBanco.classList.contains(c('usada'))) return;
        enBanco.classList.add(c('usada'));
        var item = { palabra: palabra };
        var enLinea = el('button', { type: 'button', clase: c('ficha'), texto: palabra });
        enLinea.addEventListener('click', function () {
          if (self.revisado) return;
          elegidas.splice(elegidas.indexOf(item), 1);
          linea.removeChild(enLinea);
          enBanco.classList.remove(c('usada'));
          actualizar();
        });
        elegidas.push(item);
        linea.appendChild(enLinea);
        actualizar();
      });
      banco.appendChild(enBanco);
    });

    this.cuerpo.appendChild(linea);
    this.cuerpo.appendChild(banco);

    this.revisar = function () {
      var dicho = elegidas.map(function (x) { return x.palabra; }).join(' ');
      var ok = Voz ? palabras(dicho).join(' ') === palabras(q.t.frase).join(' ') : dicho === q.t.frase.split(/\s+/).join(' ');
      linea.classList.add(c(ok ? 'ok' : 'mal'));
      return { ok: ok, correcta: q.t.frase, notas: [], decir: Voz ? q.t.frase : null };
    };
  };

  /* Tipo "hablar": decir la frase con el micrófono (solo con djc-english-voz). */
  Reto.prototype.hablar = function (q) {
    var self = this;
    this.encabezado(q, T.dilo);
    var frase = el('p', { clase: c('frase') }, [el('span', { lang: 'en', texto: q.t.frase })]);
    if (Voz.disponible) { frase.appendChild(Voz.boton(q.t.frase)); frase.appendChild(Voz.botonLento(q.t.frase)); }
    this.cuerpo.appendChild(frase);

    var oido = el('p', { clase: c('oido'), texto: T.tocaMic });
    var dicho = '';
    var mic = el('button', { type: 'button', clase: c('mic'), texto: T.hablar });

    mic.addEventListener('click', function () {
      if (self.revisado) return;
      if (self.escucha) { self.escucha.detener(); return; }
      mic.classList.add(c('escuchando'));
      mic.textContent = T.escuchando;
      oido.textContent = T.hablaAhora;
      self.escucha = Voz.escuchar({
        alResultado: function (lista) {
          var mejor = '';
          var nota = -1;
          lista.forEach(function (t) { var n = Voz.parecido(t, q.t.frase); if (n > nota) { nota = n; mejor = t; } });
          dicho = mejor;
          oido.textContent = f(T.teEntendi, { t: mejor });
          self.boton.disabled = false;
        },
        alError: function (codigo) {
          oido.textContent = codigo === 'not-allowed' || codigo === 'service-not-allowed' ? T.noPermiso : codigo === 'no-speech' ? T.noTeEscuche : T.noPude;
        },
        alTerminar: function () {
          self.escucha = null;
          mic.classList.remove(c('escuchando'));
          mic.textContent = dicho ? T.hablarOtra : T.hablar;
        }
      });
    });

    var saltar = el('button', {
      type: 'button',
      clase: c('saltar'),
      texto: T.saltar,
      onclick: function () {
        if (!self.actual.repaso) self.total = Math.max(0, self.total - 1);
        self.siguiente();
      }
    });

    this.cuerpo.appendChild(el('div', { clase: c('acciones') }, [mic]));
    this.cuerpo.appendChild(oido);
    this.acciones.appendChild(saltar);

    this.revisar = function () {
      mic.disabled = true;
      saltar.remove();
      return { ok: Voz.parecido(dicho, q.t.frase) >= 0.75, correcta: q.t.frase, notas: [], decir: q.t.frase, hablar: true };
    };
  };

  Reto.prototype.comprobar = function () {
    var self = this;
    if (this.revisado) return;
    this.revisado = true;
    if (this.escucha) { this.escucha.abortar(); this.escucha = null; }
    var q = this.actual.q;
    var repaso = this.actual.repaso;
    var r = this.revisar();

    evento('respuesta', { pregunta: q.id, dificultad: q.dificultad, acierto: r.ok ? 1 : 0, intento: repaso ? 2 : 1, idioma: LANG });

    if (!repaso) {
      this.contadas++;
      Progreso.responder({ id: q.id, dificultad: q.dificultad, acierto: r.ok, ambitos: this.ambitos(q) });
      if (r.ok) this.aciertos++;
      else if (!this.adaptativo) this.cola.push({ q: q, repaso: true });
      if (this.adaptativo) this.objetivo = Math.max(0, Math.min(100, this.objetivo + (r.ok ? 8 : -8)));
    }
    if (r.ok) this.xp += Progreso.xpPorAcierto(q.dificultad, repaso);

    var titulo = r.ok ? T.bien[Math.floor(Math.random() * T.bien.length)] : (r.hablar ? T.malHablar : T.mal);
    var caja = el('div', { clase: c('respuesta') + (r.ok ? '' : ' ' + c('respuesta-mal')) }, [
      el('p', { clase: c('respuesta-titulo'), texto: titulo })
    ]);
    if (!r.ok && !r.varias) {
      var linea = r.codigo
        ? el('div', null, [el('p', { texto: T.respuestaEs }), el('pre', { clase: c('codigo'), texto: r.correcta })])
        : el('p', null, [T.respuestaEs + ' ', el('strong', { texto: r.correcta })]);
      if (Voz && Voz.disponible && r.decir) { linea.appendChild(document.createTextNode(' ')); linea.appendChild(Voz.boton(r.decir)); }
      caja.appendChild(linea);
    }
    var simbolo = { ok: '✓', falto: '⚠', mal: '✕' };
    var orden = { ok: 0, falto: 1, mal: 2 };
    r.notas.sort(function (x, y) { return orden[x.marca] - orden[y.marca]; }); /* primero lo que era correcto */
    r.notas.forEach(function (n) {
      /* Si arriba ya dice "La respuesta es: ...", la nota de la correcta no repite su texto. */
      var yaDicha = !r.ok && !r.varias && n.marca === 'ok';
      var cuerpoNota = q.opcionesCodigo || yaDicha ? (n.explica || '') : [el('strong', { texto: n.texto }), n.explica ? ': ' + n.explica : ''];
      caja.appendChild(el('p', { clase: c('nota') }, [el('span', { clase: c('nota-marca', 'nota-' + n.marca), texto: simbolo[n.marca] }), ' '].concat(cuerpoNota)));
    });
    if (q.t.explica) caja.appendChild(el('p', { texto: q.t.explica }));
    if (!r.ok && q.origen && q.origen.url) {
      var url = q.origen.url[LANG] || q.origen.url.es;
      var nombre = (q.origen.titulo && (q.origen.titulo[LANG] || q.origen.titulo.es)) || '';
      var seccion = Progreso.seccion(q.dificultad);
      if (url) {
        caja.appendChild(el('p', null, [el('a', {
          clase: c('repasa'),
          href: new URL(url, RAIZ).href + '#' + seccion,
          texto: '📖 ' + f(T.repasa, { t: nombre, s: T.secciones[seccion].toLowerCase() })
        })]));
      }
    }
    this.respuesta.appendChild(caja);
    if (caja.scrollIntoView) caja.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    if (Voz && r.decir && (r.ok || q.tipo !== 'elegir')) Voz.decir(r.decir);

    this.hechos++;
    var continuar = el('button', { type: 'button', clase: c('btn'), texto: T.continuar, onclick: function () { self.siguiente(); } });
    this.boton.replaceWith(continuar);
    this.boton = continuar;
    continuar.focus();
  };

  Reto.prototype.final = function () {
    var self = this;
    this.limpiar();
    this.jugando = false;
    this.barra(100);

    var total = this.contadas;
    var nota = total ? this.aciertos / total : 0;
    var estrellas = nota >= 0.9 ? 3 : nota >= 0.7 ? 2 : 1;
    var puntos = Progreso.sumarXP(this.xp + XP_FINAL);
    var fin = Progreso.terminarReto(this.clave(), estrellas);
    evento('final', { reto: this.clave(), estrellas: estrellas, aciertos: this.aciertos, total: total });

    var fila = el('p', { clase: c('estrellas'), 'aria-label': f(T.estrellas, { n: estrellas }) });
    for (var i = 1; i <= 3; i++) fila.appendChild(el('span', { clase: i <= estrellas ? null : c('estrella-apagada'), texto: '⭐' }));

    var copiado = el('p', { clase: c('aviso'), hidden: true });
    var texto = f(T.textoCompartir, { r: this.titulo(), e: '⭐'.repeat(estrellas), d: dias(fin.racha), u: location.href.split('#')[0] });

    this.vista.appendChild(el('div', { clase: c('final') }, [
      el('p', { clase: c('titulo'), texto: T.terminado }),
      fila,
      el('p', { texto: T['final' + estrellas] }),
      el('p', { clase: c('sub'), texto: f(T.aciertos, { a: this.aciertos, t: total }) }),
      el('div', { clase: c('chips') }, [
        el('span', { clase: c('chip') }, ['+', el('strong', { texto: String(this.xp + XP_FINAL) }), ' ' + T.xp]),
        el('span', { clase: c('chip') }, [T.nivel + ' ', el('strong', { texto: String(puntos.nivel) }), puntos.subio ? ' ⬆️' : '']),
        el('span', { clase: c('chip') }, ['🔥 ', el('strong', { texto: String(fin.racha) }), ' ' + (fin.racha === 1 ? T.dias1 : T.dias)]),
        this.chipDominio()
      ]),
      fin.record ? el('p', { clase: c('sub'), texto: T.record }) : null,
      el('div', { clase: c('acciones') }, [
        el('button', {
          type: 'button',
          clase: c('btn-sec'),
          texto: T.compartir,
          onclick: function () {
            evento('compartir', { reto: self.clave() });
            if (navigator.share) { navigator.share({ text: texto }).catch(function () { /* cancelado */ }); return; }
            var mostrar = function (t) { copiado.textContent = t; copiado.hidden = false; };
            if (navigator.clipboard) navigator.clipboard.writeText(texto).then(function () { mostrar(T.copiado); }, function () { mostrar(texto); });
            else mostrar(texto);
          }
        })
      ]),
      copiado,
      el('p', { clase: c('aviso'), texto: T.guardado })
    ]));

    var otra = el('button', { type: 'button', clase: c('btn'), texto: T.otraVez, onclick: function () { self.empezar(self.modo); } });
    this.pie.appendChild(el('div', { clase: c('acciones') }, [
      otra,
      el('button', { type: 'button', clase: c('btn-sec'), texto: this.categoria ? T.cambiarModo : T.volver, onclick: function () { self.cerrar(); } })
    ]));
    otra.focus();
  };

  /* Atrás del navegador o del celular con un reto abierto: lo cierra. */
  window.addEventListener('popstate', function () {
    if (ABIERTO) { ABIERTO.historial = false; ABIERTO.cerrar(true); }
  });

  function iniciar() {
    if (!Progreso) { if (window.console) console.warn(P + ': falta djc-core-progreso'); return; }
    document.querySelectorAll('.' + P).forEach(function (caja) {
      if (caja.hasAttribute('data-' + P + '-listo')) return;
      caja.setAttribute('data-' + P + '-listo', '');
      new Reto(caja);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
