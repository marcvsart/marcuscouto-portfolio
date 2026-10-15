// Cabeçalho e rodapé do site inteiro, gerados a partir deste único arquivo.
// Carregado de forma síncrona logo após <header data-site-header>, para não piscar.
(function () {
  'use strict';

  var NAV = [
    { href: '/pesquisa/', label: 'Pesquisa', match: /^\/pesquisa\// },
    { href: '/#sistemas', label: 'Sistemas', match: /^\/sistemas\// },
    { href: '/poetica/', label: 'Poética', match: /^\/poetica\// },
    { href: '/fale-comigo/', label: 'Fale comigo', match: /^\/fale-comigo\// }
  ];

  var FOOTER_LINKS = [
    { href: 'mailto:mvcoutob@gmail.com', label: 'mvcoutob@gmail.com' },
    { href: 'https://www.instagram.com/marcvs/', label: 'Instagram ↗', external: true },
    { href: 'https://www.linkedin.com/in/marcusvcouto/', label: 'LinkedIn ↗', external: true },
    { href: 'https://marcvscouto.substack.com', label: 'Substack ↗', external: true }
  ];

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildHeader(header) {
    var path = location.pathname;
    header.className = 'site-header';
    var brand = el('a', { class: 'brand glitch', href: '/', 'data-glitch': 'brand' }, 'marcvs · marcus couto');
    var nav = el('nav', { class: 'site-nav', 'aria-label': 'Principal' });
    NAV.forEach(function (item) {
      var link = el('a', { href: item.href }, item.label);
      if (item.match.test(path)) link.setAttribute('aria-current', 'page');
      nav.append(link);
    });
    var lang = el('div', { class: 'lang', role: 'group', 'aria-label': 'Idioma' });
    lang.append(
      el('span', { 'aria-current': 'true', lang: 'pt-BR' }, 'PT'),
      el('span', { 'aria-hidden': 'true' }, '|'),
      el('span', { class: 'lang-off', 'aria-disabled': 'true', title: 'em breve', lang: 'en' }, 'EN')
    );
    lang.lastChild.append(el('span', { class: 'sr-only' }, ' (em breve)'));
    header.replaceChildren(brand, nav, lang);
  }

  function buildFooter(footer) {
    footer.className = 'site-footer';
    var nav = el('nav', { 'aria-label': 'Contato' });
    FOOTER_LINKS.forEach(function (item) {
      var attrs = { href: item.href };
      if (item.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
      nav.append(el('a', attrs, item.label));
    });
    footer.replaceChildren(nav, el('span', { class: 'coords' }, '23°32′S 46°38′W'));
  }

  // ---- glitch dosado ----------------------------------------------------
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var poetica = /^\/poetica\//.test(location.pathname);

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
    if (poetica) {
      // Em Poética, a marca usa o glitch pleno do marcvs.art (classe .glitching).
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
    if (poetica) return; // Poética usa o glitch pleno (poetica.js).
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
