/*
 * djc-core-ads (v1): anuncios dentro del contenido del tutorial, como en
 * search. Ver docs/ui.md.
 *
 * Inserta un anuncio después del primer cuadro (.djc-core-card) del artículo,
 * dentro de un cuadro igual a los demás y sin etiqueta. En móvil (hasta 768px,
 * el mismo corte que la barra del sitio) usa "tutorial-1-movil" (300x250); en
 * PC, "tutorial-1-pc" (adaptable). Se decide una vez, al cargar la página.
 *
 * El HTML de cada anuncio está tal cual en su archivo (tutorial-1-movil.js,
 * tutorial-1-pc.js), que se carga antes que este. Se inserta con
 * createContextualFragment y no con innerHTML para que el navegador ejecute
 * el <script> del anuncio.
 *
 * En la página, después de los archivos de los anuncios:
 *   <script src=".../core/ads/1/tutorial-1-movil.js" defer></script>
 *   <script src=".../core/ads/1/tutorial-1-pc.js" defer></script>
 *   <script src=".../core/ads/1/ads.js" defer></script>
 */
(function () {
  'use strict';

  var MOVIL = '(max-width: 768px)';

  function insertar() {
    var contenidos = window.DjcCoreAds || {};
    var html = window.matchMedia && matchMedia(MOVIL).matches ? contenidos['tutorial-1-movil'] : contenidos['tutorial-1-pc'];
    var primero = document.querySelector('main.djc-core-page > .djc-core-card');
    if (!html || !primero || document.querySelector('.djc-core-ads')) return;

    var rango = document.createRange();
    rango.selectNodeContents(primero.parentNode);
    var bloque = rango.createContextualFragment('<div class="djc-core-card djc-core-ads">\n' + html + '\n</div>');
    primero.after(bloque);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', insertar);
  else insertar();
})();
