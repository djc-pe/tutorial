/* addnav.js
 *
 * Inyecta la barra de navegacion y los drawers en la pagina.
 * Sin este script la pagina se ve normal: lo unico que falta es el nav.
 *
 *   <script src="/test/addnav.js" defer></script>
 *
 * Todo lo que necesita vive en /test/ (este archivo y nav.css), asi que
 * este prototipo no toca ningun archivo del resto del sitio.
 *
 * Es idempotente: si la pagina ya trae el nav a mano (data-nav o
 * #drawerOverlay), no inyecta nada.
 */
(function () {
  var SITE = 'https://tutorial.djc.pe/';
  var STORY = 'https://story.djc.pe/';
  var ROOT = 'https://www.djc.pe/';

  var STYLE = '/test/nav.css';

  var MARKUP = [
'<nav class="navbar">',
'  <div class="navbar__a">',
'    <a href="#" class="navbar__link">',
'      <img src="/static/www/img/menu-white.svg" alt="Menu" class="navbar__icon navbar__icon--desktop">',
'      <img src="/static/www/img/menu-white.svg" alt="Menu" class="navbar__icon navbar__icon--mobile">',
'    </a>',
'',
'    <a href="' + ROOT + '" class="navbar__link">',
'      <img src="/static/www/img/logo.png" alt="Home" class="navbar__logo navbar__icon--desktop">',
'      <img src="/static/www/img/logo-mobile.png" alt="Home" class="navbar__icon navbar__icon--mobile">',
'    </a>',
'  </div>',
'  <div class="navbar__b">',
'    <div class="navbar__b--search">',
'      <input type="text" placeholder="" aria-label="Buscar">',
'      <button>',
'        <img src="/static/www/img/search.svg" alt="Search" class="navbar__icon2">',
'      </button>',
'    </div>',
'  </div>',
'  <div class="navbar__c">',
'    <a href="#" class="navbar__link">',
'      <img src="/static/www/img/user-white.svg" alt="User" class="navbar__icon navbar__icon--desktop">',
'      <img src="/static/www/img/user-white.svg" alt="User" class="navbar__icon navbar__icon--mobile">',
'    </a>',
'  </div>',
'</nav>',
'<div class="drawer-overlay" id="drawerOverlay">',
'  <aside class="drawer" data-side="left" id="mainMenu">',
'    <div class="drawer-header">',
'      <span>DJC</span>',
'      <button class="drawer-close" aria-label="Cerrar">&#10005;</button>',
'    </div>',
'    <nav class="drawer-menu">',
'      <a href="' + ROOT + '">Inicio</a>',
'      <a href="' + STORY + '">Story</a>',
'      <a href="' + SITE + '">Tutorial</a>',
'      <hr>',
'    </nav>',
'  </aside>',
'',
'  <aside class="drawer" data-side="right" id="userMenu">',
'    <div class="drawer-header">',
'      <span>Mi cuenta</span>',
'      <button class="drawer-close" aria-label="Cerrar">&#10005;</button>',
'    </div>',
'    <nav class="drawer-menu">',
'      <a href="#">Iniciar sesión</a>',
'      <a href="#">Registrarse</a>',
'      <hr>',
'    </nav>',
'  </aside>',
'</div>'
  ].join('\n');

  function injectStyle() {
    if (document.querySelector('link[href="' + STYLE + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE;
    document.head.appendChild(link);
  }

  function injectMarkup() {
    // si ya hay un drawer en el DOM la pagina trae el nav a mano
    if (document.getElementById('drawerOverlay')) return null;

    var header = document.createElement('header');
    header.setAttribute('data-nav', '');
    header.innerHTML = MARKUP;
    document.body.insertBefore(header, document.body.firstChild);
    return header;
  }

  function wireDrawer(header) {
    var overlay = header.querySelector('.drawer-overlay');
    if (!overlay) return;

    var drawers = overlay.querySelectorAll('.drawer');

    function side(d) {
      return d.dataset.side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }

    function openDrawer(id) {
      overlay.classList.add('active');
      Array.prototype.forEach.call(drawers, function (d) {
        d.style.transform = d.id === id ? 'translateX(0)' : side(d);
      });
    }

    function closeDrawers() {
      overlay.classList.remove('active');
      Array.prototype.forEach.call(drawers, function (d) {
        d.style.transform = side(d);
      });
    }

    var menuBtn = header.querySelector('.navbar__a a');
    if (menuBtn) {
      menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer('mainMenu');
      });
    }

    var userBtn = header.querySelector('.navbar__c a:last-child');
    if (userBtn) {
      userBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer('userMenu');
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDrawers();
    });

    Array.prototype.forEach.call(header.querySelectorAll('.drawer-close'), function (btn) {
      btn.addEventListener('click', closeDrawers);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawers();
    });

    window.openDrawer = openDrawer;
    window.closeDrawers = closeDrawers;
  }

  function wireSearch(header) {
    var box = header.querySelector('.navbar__b--search');
    if (!box) return;

    var input = box.querySelector('input');
    var button = box.querySelector('button');
    if (!input || !button) return;

    function go() {
      var query = input.value.trim();
      if (!query) return;

      // crypto.subtle solo existe en contexto seguro (https o localhost)
      if (!window.crypto || !crypto.subtle) return;

      crypto.subtle.digest('SHA-256', new TextEncoder().encode(query))
        .then(function (buf) {
          var hash = Array.from(new Uint8Array(buf))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
          window.location.href = '/search/q/' + hash.match(/.{2}/g).join('/') +
            '/?text=' + encodeURIComponent(query);
        })
        .catch(function () { /* sin hash no hay busqueda */ });
    }

    button.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go();
    });
  }

  function init() {
    injectStyle();
    var header = injectMarkup() || document.querySelector('header[data-nav]');
    if (!header) return;
    wireDrawer(header);
    wireSearch(header);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();