/*
 * djc-core-idioma (v1): selector de idioma del artículo. Ver docs/ui.md.
 *
 * Lee los <link rel="alternate" hreflang="..."> del <head> y muestra, a la
 * derecha del breadcrumb, un enlace por cada idioma que tiene página. El
 * idioma actual (el de <html lang>) queda marcado. Los enlaces son relativos,
 * para que funcionen igual en local y en tutorial.djc.pe. Si la página tiene
 * un solo idioma, no muestra nada.
 *
 * Recuerda la última elección en localStorage ("djc-core-idioma-1"), solo
 * como preferencia: no redirige a nadie.
 *
 * En la página:
 *   <link rel="stylesheet" href=".../core/idioma/1/idioma.css">
 *   <script src=".../core/idioma/1/idioma.js" defer></script>
 */
(function () {
  'use strict';

  var CLAVE = 'djc-core-idioma-1';
  var NOMBRES = { es: 'ES', en: 'EN', 'zh-cn': '中文' };
  var TITULOS = { es: 'Español', en: 'English', 'zh-cn': '简体中文' };
  var ORDEN = ['es', 'en', 'zh-cn'];

  // De https://tutorial.djc.pe/es/ab/cd/ a "../../../" + "en/ab/cd/"
  function relativa(destino, canonica) {
    var niveles = canonica.split('/').filter(Boolean).length;
    var base = niveles ? new Array(niveles + 1).join('../') : './';
    return base + destino.replace(/^\//, '');
  }

  function crear() {
    var migas = document.querySelector('main.djc-core-page > .djc-core-breadcrumb');
    var canonica = document.querySelector('link[rel="canonical"]');
    if (!migas || !canonica || document.querySelector('.djc-core-idioma')) return;

    var actual = (document.documentElement.lang || '').toLowerCase();
    var enlaces = {};
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (l) {
      var lang = l.getAttribute('hreflang').toLowerCase();
      if (NOMBRES[lang]) enlaces[lang] = new URL(l.href).pathname;
    });
    var idiomas = ORDEN.filter(function (l) { return enlaces[l]; });
    if (idiomas.length < 2) return;

    var desde = new URL(canonica.href).pathname;
    var nav = document.createElement('nav');
    nav.className = 'djc-core-idioma';
    nav.setAttribute('aria-label', 'Idioma / Language / 语言');

    idiomas.forEach(function (lang) {
      var a = document.createElement('a');
      a.className = 'djc-core-idioma-item';
      a.textContent = NOMBRES[lang];
      a.title = TITULOS[lang];
      a.lang = lang;
      a.hreflang = lang;
      a.href = relativa(enlaces[lang], desde);
      if (lang === actual) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', function () {
        try { localStorage.setItem(CLAVE, lang); } catch (e) { /* sin almacenamiento */ }
        if (lang !== actual && typeof window.gtag === 'function') {
          window.gtag('event', 'djc_core_idioma', { desde: actual, hacia: lang });
        }
      });
      nav.appendChild(a);
    });

    var barra = document.createElement('div');
    barra.className = 'djc-core-idioma-bar';
    migas.parentNode.insertBefore(barra, migas);
    barra.appendChild(migas);
    barra.appendChild(nav);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crear);
  else crear();
})();
