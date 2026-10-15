// Abre a lombada indicada no endereço (ex.: /sistemas/uol/#archive-of-fame),
// inclusive quando o visitante chega por um redirecionamento das páginas antigas.
(function () {
  'use strict';
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target && target.matches('details.lombada')) {
      target.open = true;
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
