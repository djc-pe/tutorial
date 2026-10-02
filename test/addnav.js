/* addnav.js
 *
 * Inyecta la barra de navegacion y los drawers en la pagina.
 * Sin este script la pagina se ve normal: lo unico que falta es el nav.
 *
 *   <script src="/test/addnav.js" defer></script>
 *
 * El contenido (urls, iconos, textos, links) vive en data.json, al lado de
 * este archivo. Aqui solo esta el comportamiento. Para cambiar un link no se
 * toca este js.
 *
 * Es idempotente: si la pagina ya trae el nav a mano (data-nav o
 * #drawerOverlay), no inyecta nada ni pide el json.
 */
(function () {
  // si el script aparece dos veces en la pagina, la segunda no hace nada
  if (window.__djcNav) return;
  window.__djcNav = true;

  // data.json y nav.css se resuelven relativos a este archivo, asi el
  // componente se puede mover a otra carpeta sin cambiar nada.
  var SELF = document.currentScript && document.currentScript.src;
  var BASE = (SELF || '/test/addnav.js').replace(/\/[^\/]*$/, '/');
  var DATA_URL = BASE + 'data.json';
  var STYLE_URL = BASE + 'nav.css';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // {{root}} -> https://www.djc.pe/
  function token(str, data) {
    return String(str == null ? '' : str).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return key in data ? data[key] : '';
    });
  }

  function img(src, alt, cls) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" class="' + esc(cls) + '">';
  }

  function buildNavbar(d) {
    var icons = d.icons || {};
    var labels = d.labels || {};
    var logo = token(d.root, d);

    return [
      '<nav class="navbar">',
      '  <div class="navbar__a">',
      '    <a href="#" class="navbar__link">',
      '      ' + img(icons.menu, labels.menu, 'navbar__icon navbar__icon--desktop'),
      '      ' + img(icons.menu, labels.menu, 'navbar__icon navbar__icon--mobile'),
      '    </a>',
      '',
      '    <a href="' + esc(logo) + '" class="navbar__link">',
      '      ' + img(icons.logo, labels.logo, 'navbar__logo navbar__icon--desktop'),
      '      ' + img(icons.logoMobile, labels.logo, 'navbar__icon navbar__icon--mobile'),
      '    </a>',
      '  </div>',
      '  <div class="navbar__b">',
      '    <div class="navbar__b--search">',
      '      <input type="text" placeholder="" aria-label="' + esc(labels.search) + '">',
      '      <button>',
      '        ' + img(icons.search, labels.searchIcon, 'navbar__icon2'),
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div class="navbar__c">',
      '    <a href="#" class="navbar__link">',
      '      ' + img(icons.user, labels.user, 'navbar__icon navbar__icon--desktop'),
      '      ' + img(icons.user, labels.user, 'navbar__icon navbar__icon--mobile'),
      '    </a>',
      '  </div>',
      '</nav>'
    ].join('\n');
  }

  function buildDrawer(cfg, d) {
    cfg = cfg || {};
    var labels = d.labels || {};

    var links = (cfg.links || []).map(function (item) {
      // { "hr": true } dibuja un separador, para agrupar los links
      if (item && item.hr) return '      <hr>';
      return '      <a href="' + esc(token(item.url, d)) + '">' + esc(item.text) + '</a>';
    });

    var out = [
      '  <aside class="drawer" data-side="' + esc(cfg.side) + '" id="' + esc(cfg.id) + '">',
      '    <div class="drawer-header">',
      '      <span>' + esc(cfg.title) + '</span>',
      '      <button class="drawer-close" aria-label="' + esc(labels.close) + '">&#10005;</button>',
      '    </div>',
      '    <nav class="drawer-menu">'
    ];

    out = out.concat(links);
    out.push('    </nav>');
    out.push('  </aside>');

    return out.join('\n');
  }

  function buildMarkup(d) {
    var drawers = d.drawers || {};
    return [
      buildNavbar(d),
      '<div class="drawer-overlay" id="drawerOverlay">',
      buildDrawer(drawers.main, d),
      '',
      buildDrawer(drawers.user, d),
      '</div>'
    ].join('\n');
  }

  function injectStyle() {
    if (document.querySelector('link[href="' + STYLE_URL + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    document.head.appendChild(link);
  }

  function injectMarkup(d) {
    if (document.getElementById('drawerOverlay')) return null;

    var header = document.createElement('header');
    header.setAttribute('data-nav', '');
    header.innerHTML = buildMarkup(d);
    document.body.insertBefore(header, document.body.firstChild);
    return header;
  }

  function wireDrawer(header) {
    var overlay = header.querySelector('.drawer-overlay');
    if (!overlay) return;

    var drawers = overlay.querySelectorAll('.drawer');

    function side(drawer) {
      return drawer.dataset.side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }

    function openDrawer(id) {
      overlay.classList.add('active');
      Array.prototype.forEach.call(drawers, function (drawer) {
        drawer.style.transform = drawer.id === id ? 'translateX(0)' : side(drawer);
      });
    }

    function closeDrawers() {
      overlay.classList.remove('active');
      Array.prototype.forEach.call(drawers, function (drawer) {
        drawer.style.transform = side(drawer);
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

  function wireSearch(header, d) {
    var box = header.querySelector('.navbar__b--search');
    if (!box) return;

    var input = box.querySelector('input');
    var button = box.querySelector('button');
    if (!input || !button) return;

    var template = (d.search && d.search.urlTemplate) || '/search/q/{hash}/?text={query}';

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
          window.location.href = template
            .replace('{hash}', hash.match(/.{2}/g).join('/'))
            .replace('{query}', encodeURIComponent(query));
        })
        .catch(function () { /* sin hash no hay busqueda */ });
    }

    button.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go();
    });
  }

  function render(d) {
    injectStyle();
    var header = injectMarkup(d);
    // si otro addnav.js ya renderizo, no cableamos dos veces
    if (!header || header.getAttribute('data-nav-ready')) return;
    header.setAttribute('data-nav-ready', '');
    wireDrawer(header);
    wireSearch(header, d);
  }

  var started = false;

  function init() {
    // una sola vez, aunque el script corra al parsear y otra vez en DOMContentLoaded
    if (started) return;
    started = true;

    // la pagina ya trae el nav escrito a mano: no pedimos el json
    if (document.getElementById('drawerOverlay')) return;

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error(DATA_URL + ' respondio ' + res.status);
        return res.json();
      })
      .then(render)
      .catch(function (err) {
        // sin datos no hay nav, pero la pagina se sigue viendo normal
        if (window.console && console.warn) console.warn('[addnav]', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();