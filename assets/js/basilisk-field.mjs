// Presença de fundo em Poética: fragmentos da pintura Retrato do Basilisco, nunca uma silhueta desenhada.
// Mantém a imagem original intacta. Sem bibliotecas, mouse tracking ou flashes.
const SOURCE = '/assets/img/pinturas/portrait-of-the-basilisk-orb.webp';
const TAU = Math.PI * 2;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const n = clamp(value); return n * n * (3 - 2 * n); };

// Ruído estável: cada fragmento conserva o seu ritmo após resize ou pausa.
export function noise(seed) {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function fragmentsFromPixels(data, columns, rows) {
  const fragments = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const id = y * columns + x;
      const p = id * 4;
      const luminance = (data[p] * .2126 + data[p + 1] * .7152 + data[p + 2] * .0722) / 255;
      // Fragmentação irregular; abandona a borda retangular da imagem fonte.
      const u = (x + .5) / columns, v = (y + .5) / rows;
      const distance = Math.hypot((u - .5) / .56, (v - .54) / .66);
      const envelope = 1 - smooth((distance - .6) / .48);
      if (luminance < .12 || envelope < .04 || noise(id + 1) > .64) continue;
      fragments.push({
        u, v, luminance, envelope,
        phase: noise(id + 7),
        period: 32 + noise(id + 19) * 48,
        driftX: (noise(id + 41) - .5) * 16,
        driftY: -3 - noise(id + 67) * 11,
        weight: .48 + noise(id + 83) * .5,
        blue: noise(id + 103) > .976
      });
    }
  }
  return fragments;
}

export function fragmentState(fragment, elapsed, still = false) {
  // Ciclo longo: presença, erosão, suspensão e retorno em outro instante.
  const phase = (fragment.phase + (still ? 0 : elapsed / fragment.period)) % 1;
  const erosion = smooth((phase - .35) / .48);
  const appear = smooth(phase / .16);
  const vanish = 1 - smooth((phase - .7) / .3);
  return {
    alpha: appear * vanish * fragment.weight,
    x: fragment.driftX * erosion,
    y: fragment.driftY * erosion,
    size: 1 - erosion * .48
  };
}

function mountField(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mark = document.querySelector('.page-head');
  // Cores dos tokens: --ink-soft para os fragmentos, --accent para os raros pontos azuis.
  const tokens = getComputedStyle(document.documentElement);
  const gray = tokens.getPropertyValue('--ink-soft').trim() || '#93a5bb';
  const blue = tokens.getPropertyValue('--accent').trim() || '#a9caff';
  let width = 0, height = 0, fragments = [], aspect = .65;
  let raf = 0, elapsed = 0, last = 0, lastDraw = -Infinity;
  let bio = null;
  let loaded = false;

  function measureBio() {
    if (!mark) return;
    const rect = mark.getBoundingClientRect();
    bio = { left: rect.left - 24, right: rect.right + 24, top: rect.top - 28, bottom: rect.bottom + 28 };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    // Pixels voluntariamente grandes; limitar DPR reduz custo sem borrar a forma.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    measureBio();
    if (loaded) draw();
  }

  function textProtection(x, y) {
    if (!bio) return 1;
    const dx = Math.max(bio.left - x, 0, x - bio.right);
    const dy = Math.max(bio.top - y, 0, y - bio.bottom);
    return .03 + .97 * smooth(Math.hypot(dx, dy) / 90);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (!loaded) return;
    const still = motion.matches;
    const time = still ? 0 : elapsed;
    const mobile = width < 720;
    // Apenas partes da massa cabem na tela. O segundo estrato é mais rarefeito.
    const layers = [
      { cx: width * .93, top: -height * .08, h: height * 1.5, opacity: 1, offset: 0 },
      { cx: -width * .09, top: height * .42, h: height * 1.1, opacity: .48, offset: 23 }
    ];
    for (const layer of layers) {
      const w = layer.h * aspect;
      const cellW = w / 64, cellH = layer.h / 96;
      const unit = Math.max(5, Math.min(cellW, cellH));
      const breathe = still ? 1 : 1 + Math.sin(time * TAU / 26 + layer.offset) * .008;
      for (const fragment of fragments) {
        const state = fragmentState(fragment, time + layer.offset, still);
        if (state.alpha < .015) continue;
        const px = layer.cx + (fragment.u - .5) * w * breathe + state.x * unit;
        const py = layer.top + fragment.v * layer.h * breathe + state.y * unit;
        const x = Math.round(px / unit) * unit, y = Math.round(py / unit) * unit;
        if (x < -unit * 2 || x > width + unit || y < -unit * 2 || y > height + unit) continue;
        const centerDistance = Math.abs(x / width - .5) * 2;
        const edges = .2 + .8 * smooth((centerDistance - .2) / .7);
        const lower = .28 + .72 * smooth(y / height);
        const alpha = state.alpha * fragment.envelope * fragment.luminance *
          edges * lower * layer.opacity * textProtection(x, y) * (mobile ? .31 : .43);
        if (alpha < .004) continue;
        ctx.globalAlpha = Math.min(.3, alpha);
        ctx.fillStyle = fragment.blue ? blue : gray;
        const side = Math.max(2, Math.round(unit * state.size * .87));
        ctx.fillRect(x, y, side, side);
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    raf = 0;
    if (document.hidden || motion.matches || !loaded) return;
    if (last) elapsed += Math.min((now - last) / 1000, .1);
    last = now;
    if (now - lastDraw >= 1000 / 24) { draw(); lastDraw = now; }
    raf = requestAnimationFrame(tick);
  }

  function resume() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (!loaded || document.hidden) return;
    draw();
    if (!motion.matches) raf = requestAnimationFrame(tick);
  }

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    try {
      const sampler = document.createElement('canvas');
      sampler.width = 64;
      sampler.height = 96;
      const sample = sampler.getContext('2d', { willReadFrequently: true });
      if (!sample) return;
      sample.drawImage(image, 0, 0, 64, 96);
      fragments = fragmentsFromPixels(sample.getImageData(0, 0, 64, 96).data, 64, 96);
      aspect = image.naturalWidth / image.naturalHeight;
      loaded = true;
      resize();
      resume();
    } catch { canvas.hidden = true; }
  };
  image.onerror = () => { canvas.hidden = true; };
  image.src = SOURCE;

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => { measureBio(); if (motion.matches) draw(); }, { passive: true });
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; });
  window.addEventListener('pageshow', resume);
  motion.addEventListener('change', resume);
  document.fonts?.ready.then(() => { measureBio(); if (motion.matches) draw(); });
  resize();
}

if (typeof document !== 'undefined') {
  const canvas = document.getElementById('basilisk-field');
  if (canvas) mountField(canvas);
}
