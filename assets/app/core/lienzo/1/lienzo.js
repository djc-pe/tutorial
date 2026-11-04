/*
 * djc-core-lienzo (v1): el triángulo de Sierpinski dibujado en un <canvas>,
 * en vivo, con un control de nivel. Ver docs/ui.md.
 *
 *   <div class="djc-core-lienzo"></div>
 *
 * El código que se muestra es el de las funciones que dibujan (sale de su
 * toString()), así lo que se lee es exactamente lo que corre. Hay dos
 * versiones con los mismos pasos: nombres en español para la página en
 * español y en inglés para en y zh-cn.
 */
(function () {
  'use strict';

  var P = 'djc-core-lienzo';

  /* ----- Versión en español ----- */

  function triangulo(ctx, x, y, lado) {
    // (x, y) es la esquina de abajo a la izquierda
    const alto = lado * Math.sqrt(3) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + lado, y);
    ctx.lineTo(x + lado / 2, y - alto);
    ctx.closePath();
    ctx.fill();
  }

  function sierpinski(ctx, x, y, lado, nivel) {
    if (nivel === 0) {
      triangulo(ctx, x, y, lado);
      return;
    }
    const mitad = lado / 2;
    const alto = mitad * Math.sqrt(3) / 2;
    sierpinski(ctx, x, y, mitad, nivel - 1);                 // abajo a la izquierda
    sierpinski(ctx, x + mitad, y, mitad, nivel - 1);         // abajo a la derecha
    sierpinski(ctx, x + mitad / 2, y - alto, mitad, nivel - 1); // arriba
  }

  /* ----- Versión en inglés (en su propio bloque, para que también se llame sierpinski) ----- */

  var EN = (function () {
    function triangle(ctx, x, y, side) {
      // (x, y) is the bottom left corner
      const height = side * Math.sqrt(3) / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + side, y);
      ctx.lineTo(x + side / 2, y - height);
      ctx.closePath();
      ctx.fill();
    }

    function sierpinski(ctx, x, y, side, level) {
      if (level === 0) {
        triangle(ctx, x, y, side);
        return;
      }
      const half = side / 2;
      const height = half * Math.sqrt(3) / 2;
      sierpinski(ctx, x, y, half, level - 1);                  // bottom left
      sierpinski(ctx, x + half, y, half, level - 1);           // bottom right
      sierpinski(ctx, x + half / 2, y - height, half, level - 1); // top
    }

    return { dibujar: sierpinski, codigo: [triangle, sierpinski] };
  })();

  var VERSIONES = {
    es: { dibujar: sierpinski, codigo: [triangulo, sierpinski] },
    en: EN
  };

  var TEXTOS = {
    es: { nivel: 'Nivel', triangulos: '{n} triángulos', uno: '1 triángulo', codigo: 'El código (JavaScript)', dibujo: 'Triángulo de Sierpinski' },
    en: { nivel: 'Level', triangulos: '{n} triangles', uno: '1 triangle', codigo: 'The code (JavaScript)', dibujo: 'Sierpinski triangle' },
    'zh-cn': { nivel: '层级', triangulos: '{n} 个三角形', uno: '1 个三角形', codigo: '代码（JavaScript）', dibujo: '谢尔宾斯基三角形' }
  };

  function idioma() {
    var l = (document.documentElement.lang || 'es').toLowerCase();
    return l.indexOf('zh') === 0 ? 'zh-cn' : l.indexOf('en') === 0 ? 'en' : 'es';
  }

  /* El código de una función, sin la sangría que tiene dentro de este archivo. */
  function fuente(f) {
    var lineas = f.toString().split('\n');
    var ultima = lineas[lineas.length - 1];
    var sobra = ultima.length - ultima.replace(/^\s+/, '').length;
    return lineas.map(function (l, i) { return i === 0 ? l : l.slice(Math.min(sobra, l.length - l.replace(/^\s+/, '').length)); }).join('\n');
  }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function Lienzo(caja) {
    var lang = idioma();
    var T = TEXTOS[lang];
    var version = lang === 'es' ? VERSIONES.es : VERSIONES.en;
    var nivel = Math.max(0, Math.min(7, parseInt(caja.getAttribute('data-' + P + '-nivel'), 10) || 4));

    var canvas = document.createElement('canvas');
    canvas.className = P + '-canvas';
    canvas.setAttribute('role', 'img');
    var control = el('label', P + '-control');
    var valor = el('strong');
    var cuenta = el('span', P + '-cuenta');
    var rango = document.createElement('input');
    rango.type = 'range';
    rango.min = 0;
    rango.max = 7;
    rango.value = nivel;
    control.appendChild(document.createTextNode(T.nivel + ': '));
    control.appendChild(valor);
    control.appendChild(rango);
    control.appendChild(cuenta);

    var codigo = el('pre', P + '-codigo');
    codigo.appendChild(el('code', null, version.codigo.map(fuente).join('\n\n')));

    caja.appendChild(canvas);
    caja.appendChild(control);
    caja.appendChild(el('p', P + '-titulo', T.codigo));
    caja.appendChild(codigo);

    function dibujar() {
      var ancho = Math.max(200, Math.min(caja.clientWidth - 2, 560));
      var alto = Math.round(ancho * Math.sqrt(3) / 2);
      var escala = window.devicePixelRatio || 1;
      canvas.width = Math.round(ancho * escala);
      canvas.height = Math.round(alto * escala);
      canvas.style.width = ancho + 'px';
      canvas.style.height = alto + 'px';
      var ctx = canvas.getContext('2d');
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);
      ctx.fillStyle = getComputedStyle(caja).getPropertyValue('--color-accent').trim() || '#e5f774';
      version.dibujar(ctx, 0, alto, ancho, nivel);
      valor.textContent = String(nivel);
      var total = Math.pow(3, nivel);
      cuenta.textContent = total === 1 ? T.uno : T.triangulos.replace('{n}', total);
      canvas.setAttribute('aria-label', T.dibujo + ', ' + T.nivel.toLowerCase() + ' ' + nivel);
    }

    rango.addEventListener('input', function () { nivel = parseInt(rango.value, 10); dibujar(); });
    window.addEventListener('resize', dibujar);
    dibujar();
  }

  window.DjcCoreLienzo = { versiones: VERSIONES, fuente: fuente };

  function iniciar() {
    document.querySelectorAll('.' + P).forEach(function (caja) {
      if (caja.hasAttribute('data-' + P + '-listo')) return;
      caja.setAttribute('data-' + P + '-listo', '');
      Lienzo(caja);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
