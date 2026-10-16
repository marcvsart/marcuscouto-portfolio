// Cabeçalho e rodapé do site inteiro, gerados a partir deste único arquivo.
// Carregado de forma síncrona logo após <header data-site-header>, para não piscar.
(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';

  // Páginas equivalentes nas duas línguas (o botão PT | EN leva de uma à outra).
  var PAIRS = [
    ['/', '/en/'],
    ['/pesquisa/', '/en/research/'],
    ['/projetos/prensa-automata/', '/en/projects/prensa-automata/'],
    ['/projetos/zombiebasilisk/', '/en/projects/zombiebasilisk/'],
    ['/projetos/uol/', '/en/projects/uol/'],
    ['/arte/', '/en/art/'],
    ['/arte/som/', '/en/art/sound/'],
    ['/sistema/', '/en/system/']
  ];
  // Âncoras de seção que mudam de nome entre as línguas (as demais são iguais).
  var ANCHORS = [
    ['em-destaque', 'featured'], ['ensaios', 'essays'], ['filmes', 'films'], ['filme', 'film'],
    ['pintura-cryptoart', 'painting-cryptoart'], ['som', 'sound'], ['literatura', 'literature'],
    ['consultoria', 'consulting'], ['contato', 'contact'], ['sistema', 'system'], ['pesquisa', 'research'],
    ['projetos', 'projects'], ['arte', 'art']
  ];

  var NAV = EN ? [
    { href: '/en/research/', label: 'Research', match: /^\/en\/research\// },
    { href: '/en/#projects', label: 'Projects', match: /^\/en\/projects\// },
    { href: '/en/art/', label: 'Art', match: /^\/en\/art\// },
    { href: '/en/system/', label: 'System', match: /^\/en\/system\// }
  ] : [
    { href: '/pesquisa/', label: 'Pesquisa', match: /^\/pesquisa\// },
    { href: '/#projetos', label: 'Projetos', match: /^\/projetos\// },
    { href: '/arte/', label: 'Arte', match: /^\/arte\// },
    { href: '/sistema/', label: 'Sistema', match: /^\/sistema\// }
  ];

  var FOOTER_LINKS = [
    EN ? { href: '/en/system/#contact', label: 'Get in touch' } : { href: '/sistema/#contato', label: 'Fale comigo' },
    { href: 'https://www.instagram.com/marcvs/', label: 'Instagram ↗', external: true },
    { href: 'https://www.linkedin.com/in/marcusvcouto/', label: 'LinkedIn ↗', external: true },
    { href: 'https://marcvscouto.substack.com', label: 'Substack ↗', external: true }
  ];

  function counterpart() {
    var path = location.pathname.replace(/index\.html$/, '');
    var from = EN ? 1 : 0, to = EN ? 0 : 1;
    var pair = PAIRS.filter(function (p) { return p[from] === path; })[0];
    var target = pair ? pair[to] : (EN ? '/' : '/en/');
    var hash = location.hash.slice(1);
    if (hash) {
      var a = ANCHORS.filter(function (x) { return x[from] === hash; })[0];
      target += '#' + (a ? a[to] : hash);
    }
    return target;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildHeader(header) {
    var path = location.pathname;
    header.className = 'site-header';
    var brand = el('a', { class: 'brand glitch', href: EN ? '/en/' : '/', 'data-glitch': 'brand' }, 'marcvs · marcus couto');
    var nav = el('nav', { class: 'site-nav', 'aria-label': EN ? 'Main' : 'Principal' });
    NAV.forEach(function (item) {
      var link = el('a', { href: item.href }, item.label);
      if (item.match.test(path)) link.setAttribute('aria-current', 'page');
      nav.append(link);
    });
    var lang = el('div', { class: 'lang', role: 'group', 'aria-label': EN ? 'Language' : 'Idioma' });
    var other = el('a', { href: counterpart(), lang: EN ? 'pt-BR' : 'en', hreflang: EN ? 'pt-BR' : 'en' }, EN ? 'PT' : 'EN');
    other.setAttribute('aria-label', EN ? 'Ler em português' : 'Read in English');
    // Atualiza a âncora se o visitante navegar dentro da página.
    window.addEventListener('hashchange', function () { other.href = counterpart(); });
    var current = el('span', { 'aria-current': 'true' }, EN ? 'EN' : 'PT');
    lang.append(EN ? other : current, el('span', { 'aria-hidden': 'true' }, '|'), EN ? current : other);
    header.replaceChildren(brand, nav, lang);
  }

  function buildFooter(footer) {
    footer.className = 'site-footer';
    var nav = el('nav', { 'aria-label': EN ? 'Contact' : 'Contato' });
    FOOTER_LINKS.forEach(function (item) {
      var attrs = { href: item.href };
      if (item.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
      nav.append(el('a', attrs, item.label));
    });
    footer.replaceChildren(nav, el('span', { class: 'coords' }, '23°32′S 46°38′W'));
  }

  // ---- glitch dosado ----------------------------------------------------
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var arte = /^\/(en\/art|arte)\//.test(location.pathname);

  function glitch(node) {
    if (reduced.matches) return;
    var cls = node.classList.contains('glitch') ? 'is-glitching' : 'glitching';
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }
  window.siteGlitch = glitch;

  function prepare(node) {
    node.setAttribute('data-text', node.textContent);
    node.addEventListener('animationend', function (event) {
      if (event.pseudoElement === '::after' || event.target === node) node.classList.remove('is-glitching');
    });
  }

  function setupBrand(brand) {
    if (arte) {
      // Em Arte, a marca usa o glitch pleno do marcvs.art (classe .glitching).
      brand.classList.remove('glitch');
      brand.classList.add('glitch-full');
    } else {
      prepare(brand);
    }
    brand.addEventListener('mouseenter', function () { glitch(brand); });
    var schedule = function () {
      setTimeout(function () { glitch(brand); schedule(); }, (20 + Math.random() * 20) * 1000);
    };
    setTimeout(function () { glitch(brand); schedule(); }, 400);
  }

  function setupTitles() {
    if (arte) return; // Arte usa o glitch pleno (arte.js).
    document.querySelectorAll('[data-glitch="hover"]').forEach(function (title) {
      title.classList.add('glitch');
      prepare(title);
      title.addEventListener('mouseenter', function () { glitch(title); });
    });
  }

  var header = document.querySelector('[data-site-header]');
  if (header) {
    buildHeader(header);
    setupBrand(header.querySelector('.brand'));
  }
  document.addEventListener('DOMContentLoaded', function () {
    var footer = document.querySelector('[data-site-footer]');
    if (footer) buildFooter(footer);
    setupTitles();
  });
})();
