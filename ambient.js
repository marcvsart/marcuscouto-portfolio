/* A quiet field of dissolving pixels, behind the content. */
(function () {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'ambient';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  let w = 0, h = 0, frame = 0, last = 0;
  const points = Array.from({length: 28}, (_, i) => ({
    x: ((i * 137 + 23) % 997) / 997,
    y: ((i * 271 + 41) % 991) / 991,
    size: i % 3 === 0 ? 8 : 4,
    phase: i * 1.73
  }));
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(time) {
    if (time - last > 80) {
      ctx.clearRect(0, 0, w, h);
      points.forEach(p => {
        const opacity = Math.max(0, Math.sin(time / 4500 + p.phase)) * .09;
        ctx.fillStyle = `rgba(169,202,255,${opacity})`;
        ctx.fillRect(Math.round(p.x * w / 8) * 8, Math.round(p.y * h / 8) * 8, p.size, p.size);
      });
      last = time;
    }
    frame = window.requestAnimationFrame(draw);
  }
  function sync() {
    window.cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, w, h);
    if (!preference.matches && !document.hidden) frame = window.requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  resize(); sync();
})();
