/* Las animaciones de una vez ("plays": "once", animation.css) esperan a que su
   imagen se vea en pantalla. Sin JS, se hacen al cargar la página. */
(function () {
  var artes = document.querySelectorAll('.djc-core-art');
  if (!('IntersectionObserver' in window) || !artes.length) return;
  var ojo = new IntersectionObserver(function (vistas) {
    vistas.forEach(function (v) {
      if (v.isIntersecting) {
        v.target.classList.remove('djc-core-waiting');
        ojo.unobserve(v.target);
      }
    });
  }, { threshold: 0.3 });
  artes.forEach(function (a) {
    a.classList.add('djc-core-waiting');
    ojo.observe(a);
  });
})();
