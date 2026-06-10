// cross-page fade: fade body in on load, fade out before navigating
(function () {
  document.body.classList.add('loaded');

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    // only intercept same-origin, same-tab, non-modified clicks
    if (a.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    // only internal html files
    if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return;

    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 420);
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('leaving');
      document.body.classList.add('loaded');
    }
  });
})();
