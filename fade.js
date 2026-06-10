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

// ============================================================
// live drafting-table crosshair — hairlines + coordinate readout
// desktop pointers only; respects prefers-reduced-motion
// ============================================================
(function () {
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var css = document.createElement('style');
  css.textContent =
    '.xh-line{position:fixed;z-index:90;pointer-events:none;background:var(--accent,#E85A2B);opacity:0;transition:opacity .4s ease}' +
    '.xh-h{left:0;right:0;height:1px;top:0;opacity:0}' +
    '.xh-v{top:0;bottom:0;width:1px;left:0;opacity:0}' +
    'body.xh-on .xh-h,body.xh-on .xh-v{opacity:.22}' +
    '.xh-tag{position:fixed;z-index:91;pointer-events:none;font-family:"JetBrains Mono",ui-monospace,monospace;' +
    'font-size:9px;letter-spacing:.18em;color:var(--accent,#E85A2B);background:var(--bg,#EEF1F3);' +
    'border:1px solid currentColor;padding:3px 7px;opacity:0;transition:opacity .4s ease;white-space:nowrap}' +
    'body.xh-on .xh-tag{opacity:.85}';
  document.head.appendChild(css);

  var h = document.createElement('div'); h.className = 'xh-line xh-h';
  var v = document.createElement('div'); v.className = 'xh-line xh-v';
  var t = document.createElement('div'); t.className = 'xh-tag';
  t.textContent = 'X 0000 · Y 0000';
  document.body.appendChild(h);
  document.body.appendChild(v);
  document.body.appendChild(t);

  function pad4(n) { return ('0000' + Math.max(0, Math.round(n))).slice(-4); }

  var raf = null, mx = 0, my = 0;
  function paint() {
    raf = null;
    h.style.transform = 'translateY(' + my + 'px)';
    v.style.transform = 'translateX(' + mx + 'px)';
    var tx = mx + 18, ty = my + 18;
    if (tx > innerWidth - 130) tx = mx - 130;
    if (ty > innerHeight - 40) ty = my - 34;
    t.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    t.textContent = 'X ' + pad4(mx) + ' · Y ' + pad4(my);
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    document.body.classList.add('xh-on');
    if (!raf) raf = requestAnimationFrame(paint);
  });
  document.addEventListener('mouseleave', function () {
    document.body.classList.remove('xh-on');
  });
})();
