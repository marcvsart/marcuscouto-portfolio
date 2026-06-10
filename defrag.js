// ============================================================
// defrag — dot-matrix text disintegration
// [data-defrag="canvas"]  : particle canvas (hero name)
// [data-defrag="letters"] : per-letter proximity scatter
// desktop pointers only; respects prefers-reduced-motion
// ============================================================
(function () {
  if (!window.matchMedia) return;
  if (matchMedia('(pointer: coarse)').matches) return; // touch devices
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var mouse = { x: -9999, y: -9999 };
  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    mouse.x = -9999; mouse.y = -9999;
  });

  // ----------------------------------------------------------
  // mode 1: canvas particles
  // ----------------------------------------------------------
  function initCanvas(el) {
    var text = el.textContent.trim();
    var cs = getComputedStyle(el);
    if (cs.textTransform === 'uppercase') text = text.toUpperCase();
    else if (cs.textTransform === 'lowercase') text = text.toLowerCase();
    var ink = cs.color;
    var accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#0F62FE';

    // keep semantics: hide text visually, overlay canvas
    el.setAttribute('aria-label', text);
    var inner = document.createElement('span');
    inner.textContent = text;
    inner.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;pointer-events:none;';
    el.textContent = '';
    el.appendChild(inner);
    el.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var raf = null;
    var W = 0, H = 0;
    var PAD = 80; // breathing room so scattered pixels aren't clipped

    function build() {
      var fontSize = parseFloat(cs.fontSize);
      var lineH = fontSize * 1.04;
      var font = cs.fontWeight + ' ' + fontSize + 'px ' + cs.fontFamily;
      var textW = el.clientWidth;
      W = textW + PAD * 2;

      // wrap words to element width
      var off = document.createElement('canvas');
      var octx = off.getContext('2d');
      octx.font = font;
      var words = text.split(/\s+/);
      var lines = [], line = '';
      for (var i = 0; i < words.length; i++) {
        var probe = line ? line + ' ' + words[i] : words[i];
        if (octx.measureText(probe).width > textW * 0.96 && line) {
          lines.push(line); line = words[i];
        } else line = probe;
      }
      lines.push(line);

      var textH = Math.ceil(lines.length * lineH);
      H = textH + PAD * 2;
      off.width = Math.ceil(W * dpr);
      off.height = Math.ceil(H * dpr);
      octx.scale(dpr, dpr);
      octx.font = font;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = '#000';
      for (var l = 0; l < lines.length; l++) {
        octx.fillText(lines[l], W / 2, PAD + lineH * (l + 0.5));
      }

      canvas.width = off.width;
      canvas.height = off.height;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.style.margin = (-PAD) + 'px ' + (-PAD) + 'px';

      // sample filled pixels → particles
      var gap = Math.max(3, Math.round(fontSize / 26)); // css px between samples
      var img = octx.getImageData(0, 0, off.width, off.height).data;
      particles.length = 0;
      for (var y = 0; y < H; y += gap) {
        for (var x = 0; x < W; x += gap) {
          var idx = ((y * dpr | 0) * off.width + (x * dpr | 0)) * 4 + 3;
          if (img[idx] > 128) {
            particles.push({
              ox: x, oy: y, x: x, y: y, vx: 0, vy: 0,
              s: gap * 0.78,
              c: Math.random() < 0.05 ? accent : ink
            });
          }
        }
      }
      drawStatic();
    }

    function drawStatic() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    }

    var RADIUS = 130, FORCE = 9, SPRING = 0.06, DAMP = 0.8;

    function tick() {
      var rect = canvas.getBoundingClientRect();
      var mx = mouse.x - rect.left;
      var my = mouse.y - rect.top;
      var alive = false;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = p.x - mx, dy = p.y - my;
        var d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS) {
          var d = Math.sqrt(d2) || 1;
          var f = (1 - d / RADIUS) * FORCE;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        p.vx *= DAMP;
        p.vy *= DAMP;
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.05 ||
            Math.abs(p.x - p.ox) > 0.3 || Math.abs(p.y - p.oy) > 0.3) alive = true;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }

      if (alive || nearCanvas()) raf = requestAnimationFrame(tick);
      else { raf = null; snapHome(); }
    }

    function nearCanvas() {
      var r = canvas.getBoundingClientRect();
      return mouse.x > r.left - RADIUS && mouse.x < r.right + RADIUS &&
             mouse.y > r.top - RADIUS && mouse.y < r.bottom + RADIUS;
    }

    function snapHome() {
      for (var i = 0; i < particles.length; i++) {
        particles[i].x = particles[i].ox;
        particles[i].y = particles[i].oy;
        particles[i].vx = 0; particles[i].vy = 0;
      }
      drawStatic();
    }

    document.addEventListener('mousemove', function () {
      if (!raf && nearCanvas()) raf = requestAnimationFrame(tick);
    });

    var rT = null;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(build, 180);
    });

    build();
  }

  // ----------------------------------------------------------
  // mode 2: per-letter scatter
  // ----------------------------------------------------------
  var letterEls = [];

  function initLetters(el) {
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var str = node.nodeValue;
      for (var i = 0; i < str.length; i++) {
        if (/\s/.test(str[i])) {
          frag.appendChild(document.createTextNode(str[i]));
        } else {
          var s = document.createElement('span');
          s.className = 'dfx';
          s.textContent = str[i];
          frag.appendChild(s);
        }
      }
      node.parentNode.replaceChild(frag, node);
    });
    letterEls.push(el);
  }

  var style = document.createElement('style');
  style.textContent =
    '.dfx{display:inline-block;transition:transform .45s cubic-bezier(.2,.9,.3,1.2);will-change:transform;}';
  document.head.appendChild(style);

  var RADIUS_L = 110, MAXPUSH = 14;
  var ticking = false;

  function scatterPass() {
    ticking = false;
    for (var e = 0; e < letterEls.length; e++) {
      var el = letterEls[e];
      var r = el.getBoundingClientRect();
      var near = mouse.x > r.left - RADIUS_L && mouse.x < r.right + RADIUS_L &&
                 mouse.y > r.top - RADIUS_L && mouse.y < r.bottom + RADIUS_L;
      var spans = el.querySelectorAll('.dfx');
      for (var i = 0; i < spans.length; i++) {
        var sp = spans[i];
        if (!near) {
          if (sp.style.transform) sp.style.transform = '';
          continue;
        }
        var b = sp.getBoundingClientRect();
        var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var dx = cx - mouse.x, dy = cy - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < RADIUS_L) {
          var f = (1 - d / RADIUS_L);
          var push = f * f * MAXPUSH;
          var rot = (i % 2 ? 1 : -1) * f * 6;
          sp.style.transform =
            'translate(' + (dx / d * push).toFixed(1) + 'px,' +
            (dy / d * push).toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)';
        } else if (sp.style.transform) {
          sp.style.transform = '';
        }
      }
    }
  }

  document.addEventListener('mousemove', function () {
    if (!ticking && letterEls.length) {
      ticking = true;
      requestAnimationFrame(scatterPass);
    }
  });

  // ----------------------------------------------------------
  // boot after fonts load (canvas needs Doto rendered)
  // ----------------------------------------------------------
  function boot() {
    document.querySelectorAll('[data-defrag="canvas"]').forEach(initCanvas);
    document.querySelectorAll('[data-defrag="letters"]').forEach(initLetters);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    window.addEventListener('load', boot);
  }
})();
