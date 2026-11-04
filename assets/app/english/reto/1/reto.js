/*
 * djc-english-reto (v1): retos gamificados de la serie Inglés desde cero.
 * Necesita el componente djc-english-voz (cargarlo antes).
 *
 * Uso en una lección:
 *   <div class="djc-english-reto" data-djc-english-reto="ingles-01">
 *     <script type="application/json">{ "titulo": "...", "ejercicios": [...] }</script>
 *   </div>
 *
 * Tipos de ejercicio:
 *   elegir   { tipo, pregunta, frase?, oir?, opciones: [...], correcta: 0, opcionesEn?, explica? }
 *            Con "oir": true la frase solo se escucha, no se muestra.
 *   ordenar  { tipo, pregunta, frase, extra?: [...], explica? }
 *   hablar   { tipo, pregunta, frase, explica? }   (solo si el navegador reconoce voz)
 *
 * El progreso se guarda en localStorage, solo en este navegador.
 */
(function () {
  'use strict';

  var P = 'djc-english-reto';
  var CLAVE = 'djc-english-reto-1';
  var XP_PRIMERA = 10;
  var XP_REPASO = 5;
  var XP_FINAL = 20;
  var XP_POR_NIVEL = 100;

  /* Si falta el componente de voz, el reto funciona sin audio ni micrófono. */
  var Voz = window.DjcEnglishVoz || {
    disponible: false,
    reconoce: false,
    decir: function () {},
    cancelar: function () {},
    parecido: function () { return 0; },
    palabras: function (t) { return String(t || '').toLowerCase().split(/\s+/); }
  };

  /* ---------- Progreso guardado ---------- */

  function hoy(desfase) {
    var d = new Date();
    if (desfase) d.setDate(d.getDate() + desfase);
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia;
  }

  function leer() {
    var vacio = { xp: 0, racha: 0, ultimoDia: '', lecciones: {} };
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE));
      if (!datos || typeof datos !== 'object') return vacio;
      return {
        xp: Number(datos.xp) || 0,
        racha: Number(datos.racha) || 0,
        ultimoDia: String(datos.ultimoDia || ''),
        lecciones: datos.lecciones && typeof datos.lecciones === 'object' ? datos.lecciones : {}
      };
    } catch (e) {
      return vacio;
    }
  }

  function guardar(datos) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch (e) { /* modo privado o almacenamiento lleno: el reto sigue funcionando */ }
  }

  /* La racha cuenta si practicaste hoy o ayer; si no, ya se cortó. */
  function rachaActual(datos) {
    if (datos.ultimoDia === hoy() || datos.ultimoDia === hoy(-1)) return datos.racha;
    return 0;
  }

  function nivel(xp) {
    return Math.floor(xp / XP_POR_NIVEL) + 1;
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

  /* Clase con el prefijo del componente: c('btn') → "djc-english-reto-btn". */
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

  function mismaFrase(a, b) {
    return Voz.palabras(a).join(' ') === Voz.palabras(b).join(' ');
  }

  function evento(nombre, datos) {
    try { if (typeof window.gtag === 'function') window.gtag('event', 'djc_english_reto_' + nombre, datos); } catch (e) { /* sin analítica */ }
  }

  /* ---------- Un reto ---------- */

  function Reto(caja) {
    var config;
    try {
      config = JSON.parse(caja.querySelector('script[type="application/json"]').textContent);
    } catch (e) {
      return;
    }
    this.caja = caja;
    this.id = caja.getAttribute('data-' + P) || 'reto';
    this.titulo = config.titulo || 'Reto';
    this.compartir = config.compartir || location.href.split('#')[0];
    this.ejercicios = (config.ejercicios || []).filter(function (ej) {
      if (ej.tipo === 'hablar') return Voz.reconoce;
      if (ej.oir && !Voz.disponible) ej.oir = false; /* sin voz: se muestra la frase */
      return true;
    });
    this.vista = el('div', { 'aria-live': 'polite' });
    caja.appendChild(this.vista);
    this.inicio();
  }

  Reto.prototype.limpiar = function () {
    if (this.escucha) { this.escucha.abortar(); this.escucha = null; }
    Voz.cancelar();
    this.vista.textContent = '';
  };

  Reto.prototype.chips = function (datos, extra) {
    var racha = rachaActual(datos);
    var lista = [
      el('span', { clase: c('chip') }, ['Nivel ', el('strong', { texto: String(nivel(datos.xp)) })]),
      el('span', { clase: c('chip') }, [el('strong', { texto: String(datos.xp) }), ' XP']),
      el('span', { clase: c('chip') }, ['🔥 ', el('strong', { texto: String(racha) }), racha === 1 ? ' día seguido' : ' días seguidos'])
    ];
    return el('div', { clase: c('chips') }, lista.concat(extra || []));
  };

  Reto.prototype.inicio = function () {
    var self = this;
    this.limpiar();
    var datos = leer();
    var previo = datos.lecciones[this.id];
    var extra = previo ? [el('span', { clase: c('chip') }, ['Tu mejor marca: ', el('strong', { texto: '⭐'.repeat(previo.estrellas || 0) || '0' })])] : [];
    var minutos = Math.max(1, Math.round(this.ejercicios.length * 0.3));

    this.vista.appendChild(el('div', null, [
      el('p', { clase: c('titulo'), texto: this.titulo }),
      el('p', { clase: c('sub'), texto: this.ejercicios.length + ' ejercicios, unos ' + minutos + ' minutos. Equivocarte no te quita nada: lo que falles vuelve al final.' }),
      this.chips(datos, extra),
      el('div', { clase: c('acciones') }, [
        el('button', { type: 'button', clase: c('btn'), texto: previo ? 'Jugar otra vez' : 'Empezar el reto', onclick: function () { self.empezar(); } })
      ]),
      !Voz.disponible ? el('p', { clase: c('aviso'), texto: 'Tu navegador no puede leer en voz alta, así que verás las frases escritas.' }) : null
    ]));
  };

  Reto.prototype.empezar = function () {
    this.cola = this.ejercicios.map(function (ej) { return { ej: ej, repaso: false }; });
    this.total = this.cola.length;
    this.hechos = 0;
    this.aciertosPrimera = 0;
    this.aciertosRepaso = 0;
    this.contados = this.total; /* baja si el lector salta un ejercicio de hablar */
    evento('inicio', { reto: this.id });
    this.siguiente();
  };

  Reto.prototype.siguiente = function () {
    if (!this.cola.length) { this.final(); return; }
    this.actual = this.cola.shift();
    this.mostrar();
  };

  Reto.prototype.repasosPendientes = function () {
    var n = this.actual && this.actual.repaso ? 1 : 0;
    return this.cola.filter(function (x) { return x.repaso; }).length + n;
  };

  Reto.prototype.mostrar = function () {
    var self = this;
    var ej = this.actual.ej;
    this.limpiar();

    var avance = Math.round(this.hechos / (this.total + this.repasosPendientes()) * 100);
    var relleno = el('div', { clase: c('barra-relleno') });
    relleno.style.width = avance + '%';

    this.cuerpo = el('div');
    this.respuesta = el('div');
    this.boton = el('button', { type: 'button', clase: c('btn'), texto: 'Comprobar', disabled: true, onclick: function () { self.comprobar(); } });
    this.acciones = el('div', { clase: c('acciones') }, [this.boton]);

    this.vista.appendChild(el('div', null, [
      el('div', { clase: c('barra') }, [
        el('button', { type: 'button', clase: c('cerrar'), 'aria-label': 'Salir del reto', title: 'Salir', texto: '×', onclick: function () { self.inicio(); } }),
        el('div', { clase: c('barra-fondo'), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(avance) }, [relleno])
      ]),
      this.actual.repaso ? el('p', { clase: c('tipo'), texto: 'Otra vez' }) : null,
      this.cuerpo,
      this.respuesta,
      this.acciones
    ]));

    this.revisado = false;
    if (ej.tipo === 'ordenar') this.ordenar(ej);
    else if (ej.tipo === 'hablar') this.hablar(ej);
    else this.elegir(ej);
  };

  /* Tipo "elegir": escuchar o leer y elegir una opción. */
  Reto.prototype.elegir = function (ej) {
    var self = this;
    var cuerpo = this.cuerpo;
    cuerpo.appendChild(el('p', { clase: c('tipo'), texto: ej.oir ? 'Escucha y elige' : 'Elige' }));
    cuerpo.appendChild(el('p', { clase: c('pregunta'), texto: ej.pregunta }));

    if (ej.frase && ej.oir) {
      var grande = Voz.boton(ej.frase, { clase: 'djc-english-voz-btn-grande', etiqueta: 'Escuchar la frase' });
      cuerpo.appendChild(el('p', { clase: c('frase') }, [grande, Voz.botonLento(ej.frase)]));
      setTimeout(function () { Voz.decir(ej.frase, { boton: grande }); }, 300);
    } else if (ej.frase) {
      var frase = el('p', { clase: c('frase') }, [el('span', { lang: 'en', texto: ej.frase })]);
      if (Voz.disponible) frase.appendChild(Voz.boton(ej.frase));
      cuerpo.appendChild(frase);
    }

    var grupo = el('div', { clase: c('opciones'), role: 'group' });
    this.elegida = null;
    var botones = [];
    mezclar(ej.opciones.map(function (_, i) { return i; })).forEach(function (i) {
      var b = el('button', {
        type: 'button',
        clase: c('opcion'),
        lang: ej.opcionesEn ? 'en' : null,
        'aria-pressed': 'false',
        texto: ej.opciones[i],
        onclick: function () {
          if (self.revisado) return;
          botones.forEach(function (o) { o.classList.remove(c('elegida')); o.setAttribute('aria-pressed', 'false'); });
          b.classList.add(c('elegida'));
          b.setAttribute('aria-pressed', 'true');
          self.elegida = i;
          self.boton.disabled = false;
        }
      });
      b.setAttribute('data-' + P + '-i', i);
      botones.push(b);
      grupo.appendChild(b);
    });
    cuerpo.appendChild(grupo);

    this.revisar = function () {
      botones.forEach(function (o) {
        var i = Number(o.getAttribute('data-' + P + '-i'));
        if (i === ej.correcta) o.classList.add(c('ok'));
        else if (i === self.elegida) o.classList.add(c('mal'));
        o.disabled = true;
      });
      return {
        ok: self.elegida === ej.correcta,
        correcta: ej.opciones[ej.correcta],
        decir: ej.opcionesEn ? ej.opciones[ej.correcta] : ej.frase
      };
    };
  };

  /* Tipo "ordenar": tocar las palabras en el orden correcto. */
  Reto.prototype.ordenar = function (ej) {
    var self = this;
    var cuerpo = this.cuerpo;
    cuerpo.appendChild(el('p', { clase: c('tipo'), texto: 'Ordena las palabras' }));
    cuerpo.appendChild(el('p', { clase: c('pregunta'), texto: ej.pregunta }));

    var linea = el('div', { clase: c('linea'), lang: 'en', 'aria-label': 'Tu respuesta' });
    var banco = el('div', { clase: c('banco'), lang: 'en', 'aria-label': 'Palabras' });
    var elegidas = [];

    function actualizar() { self.boton.disabled = elegidas.length === 0; }

    mezclar(ej.frase.split(/\s+/).concat(ej.extra || [])).forEach(function (palabra) {
      var enBanco = el('button', { type: 'button', clase: c('ficha'), texto: palabra });
      enBanco.addEventListener('click', function () {
        if (self.revisado || enBanco.classList.contains(c('usada'))) return;
        enBanco.classList.add(c('usada'));
        var enLinea = el('button', { type: 'button', clase: c('ficha'), texto: palabra });
        var item = { palabra: palabra };
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

    cuerpo.appendChild(linea);
    cuerpo.appendChild(banco);

    this.revisar = function () {
      var dicho = elegidas.map(function (x) { return x.palabra; }).join(' ');
      var ok = mismaFrase(dicho, ej.frase);
      linea.classList.add(c(ok ? 'ok' : 'mal'));
      return { ok: ok, correcta: ej.frase, decir: ej.frase };
    };
  };

  /* Tipo "hablar": decir la frase en voz alta con el micrófono. */
  Reto.prototype.hablar = function (ej) {
    var self = this;
    var cuerpo = this.cuerpo;
    cuerpo.appendChild(el('p', { clase: c('tipo'), texto: 'Dilo en voz alta' }));
    cuerpo.appendChild(el('p', { clase: c('pregunta'), texto: ej.pregunta }));
    var frase = el('p', { clase: c('frase') }, [el('span', { lang: 'en', texto: ej.frase })]);
    if (Voz.disponible) { frase.appendChild(Voz.boton(ej.frase)); frase.appendChild(Voz.botonLento(ej.frase)); }
    cuerpo.appendChild(frase);

    var oido = el('p', { clase: c('oido'), texto: 'Toca el micrófono y di la frase.' });
    var dicho = '';
    var mic = el('button', { type: 'button', clase: c('mic'), texto: '🎙️ Hablar' });

    mic.addEventListener('click', function () {
      if (self.revisado) return;
      if (self.escucha) { self.escucha.detener(); return; }
      mic.classList.add(c('escuchando'));
      mic.textContent = '⏺ Escuchando…';
      oido.textContent = 'Habla ahora.';
      self.escucha = Voz.escuchar({
        alResultado: function (lista) {
          var mejor = '';
          var mejorNota = -1;
          lista.forEach(function (t) {
            var nota = Voz.parecido(t, ej.frase);
            if (nota > mejorNota) { mejorNota = nota; mejor = t; }
          });
          dicho = mejor;
          oido.textContent = 'Te entendí: "' + mejor + '"';
          self.boton.disabled = false;
        },
        alError: function (codigo) {
          if (codigo === 'not-allowed' || codigo === 'service-not-allowed') {
            oido.textContent = 'No tengo permiso para usar el micrófono. Puedes saltar este ejercicio.';
          } else if (codigo === 'no-speech') {
            oido.textContent = 'No te escuché. Inténtalo otra vez, un poco más fuerte.';
          } else {
            oido.textContent = 'No pude escucharte. Inténtalo otra vez o salta este ejercicio.';
          }
        },
        alTerminar: function () {
          self.escucha = null;
          mic.classList.remove(c('escuchando'));
          mic.textContent = dicho ? '🎙️ Otra vez' : '🎙️ Hablar';
        }
      });
    });

    var saltar = el('button', {
      type: 'button',
      clase: c('saltar'),
      texto: 'Ahora no puedo hablar',
      onclick: function () {
        self.contados--;
        self.hechos++;
        self.siguiente();
      }
    });

    cuerpo.appendChild(el('div', { clase: c('acciones') }, [mic]));
    cuerpo.appendChild(oido);
    this.acciones.appendChild(saltar);

    this.revisar = function () {
      mic.disabled = true;
      saltar.remove();
      return { ok: Voz.parecido(dicho, ej.frase) >= 0.75, correcta: ej.frase, decir: ej.frase, hablar: true };
    };
  };

  Reto.prototype.comprobar = function () {
    var self = this;
    if (this.revisado) return;
    this.revisado = true;
    if (this.escucha) { this.escucha.abortar(); this.escucha = null; }
    var r = this.revisar();
    var ej = this.actual.ej;

    if (r.ok) {
      if (this.actual.repaso) this.aciertosRepaso++;
      else this.aciertosPrimera++;
    } else if (!this.actual.repaso) {
      this.cola.push({ ej: ej, repaso: true });
    }

    var titulo = r.ok
      ? ['Bien hecho.', 'Correcto.', 'Eso es.', 'Muy bien.'][Math.floor(Math.random() * 4)]
      : (r.hablar ? 'Casi. Escúchala y vuelve a intentarlo al final.' : 'No pasa nada, aprendemos de esto.');

    var caja = el('div', { clase: c('respuesta') + (r.ok ? '' : ' ' + c('respuesta-mal')) }, [
      el('p', { clase: c('respuesta-titulo'), texto: titulo })
    ]);
    if (!r.ok) {
      var linea = el('p', null, ['La respuesta es: ', el('strong', { texto: r.correcta })]);
      if (Voz.disponible && r.decir) { linea.appendChild(document.createTextNode(' ')); linea.appendChild(Voz.boton(r.decir)); }
      caja.appendChild(linea);
    }
    if (ej.explica) caja.appendChild(el('p', { texto: ej.explica }));
    this.respuesta.appendChild(caja);

    if (r.decir && (r.ok || ej.tipo !== 'elegir')) Voz.decir(r.decir);

    this.hechos++;
    var continuar = el('button', { type: 'button', clase: c('btn'), texto: 'Continuar', onclick: function () { self.siguiente(); } });
    this.boton.replaceWith(continuar);
    this.boton = continuar;
    continuar.focus();
  };

  Reto.prototype.final = function () {
    var self = this;
    this.limpiar();

    var nota = this.contados ? this.aciertosPrimera / this.contados : 0;
    var estrellas = nota >= 0.9 ? 3 : nota >= 0.7 ? 2 : 1;
    var ganado = this.aciertosPrimera * XP_PRIMERA + this.aciertosRepaso * XP_REPASO + XP_FINAL;

    var datos = leer();
    var nivelAntes = nivel(datos.xp);
    datos.xp += ganado;
    if (datos.ultimoDia !== hoy()) {
      datos.racha = datos.ultimoDia === hoy(-1) ? datos.racha + 1 : 1;
      datos.ultimoDia = hoy();
    }
    var previo = datos.lecciones[this.id] || { estrellas: 0, veces: 0 };
    var record = estrellas > (previo.estrellas || 0);
    datos.lecciones[this.id] = {
      estrellas: Math.max(estrellas, previo.estrellas || 0),
      veces: (previo.veces || 0) + 1,
      ultima: hoy()
    };
    guardar(datos);
    var subio = nivel(datos.xp) > nivelAntes;

    evento('final', { reto: this.id, estrellas: estrellas, aciertos: this.aciertosPrimera, total: this.contados });

    var mensajes = {
      3: 'Perfecto. Esto ya es tuyo.',
      2: 'Muy bien. Repite el reto para conseguir las 3 estrellas.',
      1: 'Buen comienzo. Repasa las frases de arriba y vuelve a intentarlo.'
    };

    var fila = el('p', { clase: c('estrellas'), 'aria-label': estrellas + ' de 3 estrellas' });
    for (var i = 1; i <= 3; i++) fila.appendChild(el('span', { clase: i <= estrellas ? null : c('estrella-apagada'), texto: '⭐' }));

    var copiado = el('p', { clase: c('aviso'), hidden: true });
    var texto = this.titulo + ': ' + '⭐'.repeat(estrellas) + '\n🔥 ' + datos.racha + (datos.racha === 1 ? ' día seguido' : ' días seguidos') + ' aprendiendo inglés\n' + this.compartir;

    this.vista.appendChild(el('div', { clase: c('final') }, [
      el('p', { clase: c('titulo'), texto: 'Reto terminado' }),
      fila,
      el('p', { texto: mensajes[estrellas] }),
      el('p', { clase: c('sub'), texto: 'Acertaste ' + this.aciertosPrimera + ' de ' + this.contados + ' a la primera.' }),
      el('div', { clase: c('chips') }, [
        el('span', { clase: c('chip') }, ['+', el('strong', { texto: String(ganado) }), ' XP']),
        el('span', { clase: c('chip') }, ['Nivel ', el('strong', { texto: String(nivel(datos.xp)) }), subio ? ' ⬆️' : '']),
        el('span', { clase: c('chip') }, ['🔥 ', el('strong', { texto: String(datos.racha) }), datos.racha === 1 ? ' día seguido' : ' días seguidos'])
      ]),
      record && previo.estrellas ? el('p', { clase: c('sub'), texto: 'Nueva mejor marca en esta lección.' }) : null,
      el('div', { clase: c('acciones') }, [
        el('button', { type: 'button', clase: c('btn'), texto: 'Jugar otra vez', onclick: function () { self.empezar(); } }),
        el('button', {
          type: 'button',
          clase: c('btn-sec'),
          texto: 'Compartir',
          onclick: function () {
            evento('compartir', { reto: self.id });
            if (navigator.share) {
              navigator.share({ text: texto }).catch(function () { /* cancelado */ });
              return;
            }
            var mostrar = function (t) { copiado.textContent = t; copiado.hidden = false; };
            if (navigator.clipboard) navigator.clipboard.writeText(texto).then(function () { mostrar('Copiado. Pégalo donde quieras.'); }, function () { mostrar(texto); });
            else mostrar(texto);
          }
        })
      ]),
      copiado,
      el('p', { clase: c('aviso'), texto: 'Tu progreso se guarda solo en este navegador.' })
    ]));
  };

  function iniciar() {
    document.querySelectorAll('.' + P + '[data-' + P + ']').forEach(function (caja) { new Reto(caja); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
