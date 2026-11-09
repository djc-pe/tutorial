/* El botón para copiar el código de un elemento code (sin los números de línea). */
(function () {
  var TEXTO = { es: ['Copiar', 'Copiado'], en: ['Copy', 'Copied'], 'zh-cn': ['复制', '已复制'] };
  var lang = (document.documentElement.lang || 'es').toLowerCase();
  var t = TEXTO[lang] || TEXTO.es;
  document.querySelectorAll('[data-djc-code]').forEach(function (caja) {
    var barra = caja.querySelector('.djc-core-code-bar');
    if (!barra || !navigator.clipboard) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'djc-core-code-copy';
    b.textContent = t[0];
    b.addEventListener('click', function () {
      var lineas = Array.prototype.map.call(caja.querySelectorAll('.djc-core-code-text'), function (l) {
        return l.textContent;
      });
      navigator.clipboard.writeText(lineas.join('\n') + '\n').then(function () {
        b.textContent = t[1];
        setTimeout(function () { b.textContent = t[0]; }, 1500);
      });
    });
    barra.appendChild(b);
  });
})();
