// Abertura da home: o retrato se decompõe numa grade de coordenadas e se recompõe,
// sem parar, e o título se decifra ao carregar e depois ganha um glitch leve.
// Com "reduzir movimento" ativado, nada disso roda: ficam a imagem e o texto parados.
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- título: decifra da esquerda para a direita ------------------------
  var title = document.querySelector('.intro .phrase');
  if (title) {
    var finalText = title.textContent;
    var POOL = 'abcdefghijklmnopqrstuvwxyz0123456789#/<>';
    var t0 = null, DUR = 1100;
    title.setAttribute('aria-label', finalText);
    (function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / DUR), out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText[i];
        if (i < p * finalText.length || /[\s,.’']/.test(ch)) out += ch;
        else {
          var r = POOL[(Math.random() * POOL.length) | 0];
          out += ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? r.toUpperCase() : r;
        }
      }
      title.textContent = out;
      if (p < 1) return requestAnimationFrame(step);
      title.textContent = finalText;
      title.setAttribute('data-text', finalText);
      // Depois de decifrado, um glitch leve de tempos em tempos (o mesmo da marca).
      (function again() {
        setTimeout(function () { if (window.siteGlitch && !document.hidden) window.siteGlitch(title); again(); }, (5 + Math.random() * 6) * 1000);
      })();
    })(performance.now());
  }

  // ---- retrato: rosto ↔ grade de coordenadas -----------------------------
  var img = document.querySelector('.portrait');
  if (!img) return;
  var CELL = 3, DOT = 2, SIZE = 600, GRID = 20; // GRID: uma linha do mapa a cada 20 pixels do retrato

  function start() {
    var src = document.createElement('canvas');
    src.width = src.height = SIZE;
    var sctx = src.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(img, 0, 0, SIZE, SIZE);
    var data;
    try { data = sctx.getImageData(0, 0, SIZE, SIZE).data; } catch (e) { return; }

    // Cada pixel aceso vira uma partícula com dois endereços: o do rosto e o da grade.
    var parts = [], n = SIZE / CELL;
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var k = (j * CELL * SIZE + i * CELL) * 4;
      if (data[k + 3] < 128) continue;
      var di = ((i + GRID / 2) % GRID) - GRID / 2, dj = ((j + GRID / 2) % GRID) - GRID / 2;
      var onX = Math.abs(di) < Math.abs(dj) || (Math.abs(di) === Math.abs(dj) && (i + j) % 2);
      parts.push({
        x: i * CELL, y: j * CELL,
        gx: (onX ? i - di : i) * CELL, gy: (onX ? j : j - dj) * CELL,
        hi: data[k] > 200, // pixels claros do glitch original
        d: 0, s: Math.random() * 6.283
      });
    }
    if (!parts.length) return;

    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    canvas.className = img.className;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', img.alt);
    var ctx = canvas.getContext('2d');
    img.replaceWith(canvas);

    var styles = getComputedStyle(document.documentElement);
    var INK = styles.getPropertyValue('--accent').trim() || '#a9caff';
    var HI = styles.getPropertyValue('--ink').trim() || '#e5ebf4';

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // m: 0 = rosto, 1 = grade. Cada partícula parte com um atraso (onda a partir de um ponto).
    function draw(m, towardMap) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? HI : INK;
        for (var q = 0; q < parts.length; q++) {
          var p = parts[q];
          if (p.hi !== !!pass) continue;
          var local = Math.max(0, Math.min(1, (m - p.d * 0.55) / 0.45));
          if (!towardMap) local = 1 - Math.max(0, Math.min(1, ((1 - m) - p.d * 0.55) / 0.45));
          var e = ease(local), mid = Math.sin(local * Math.PI);
          var x = p.x + (p.gx - p.x) * e + Math.cos(p.s) * mid * 14;
          var y = p.y + (p.gy - p.y) * e + Math.sin(p.s) * mid * 14;
          ctx.globalAlpha = 1 - e * 0.5;
          ctx.fillRect(x | 0, y | 0, DOT, DOT);
        }
      }
      ctx.globalAlpha = 1;
    }

    function wave() { // novo ponto de origem a cada passagem
      var ox = Math.random() * SIZE, oy = Math.random() * SIZE, max = 0, q;
      for (q = 0; q < parts.length; q++) { parts[q].d = Math.hypot(parts[q].x - ox, parts[q].y - oy); if (parts[q].d > max) max = parts[q].d; }
      for (q = 0; q < parts.length; q++) parts[q].d /= max;
    }

    var visible = true;
    function run(from, to, ms, done) {
      var t0 = performance.now();
      (function frame(now) {
        var t = Math.min(1, (now - t0) / ms);
        draw(from + (to - from) * t, to > from);
        if (t < 1) requestAnimationFrame(frame); else if (done) done();
      })(t0);
    }
    // Vai e volta sem parar: rosto → grade → rosto, com uma pausa curta em cada ponta.
    // Fora da tela ou com a aba em segundo plano, espera.
    function loop() {
      if (!visible || document.hidden) return setTimeout(loop, 800);
      wave();
      run(0, 1, 1900, function () {
        setTimeout(function () { wave(); run(1, 0, 2100, function () { setTimeout(loop, 2400); }); }, 900);
      });
    }

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);

    // Ao carregar, o rosto se monta a partir da grade.
    wave();
    run(1, 0, 2200, function () { setTimeout(loop, 2400); });
  }

  if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
})();
