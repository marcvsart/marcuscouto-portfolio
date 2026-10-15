// Preenche os números a partir de data/numeros.json.
//   <span data-numero="grupo.chave" data-formato="extenso|curto|inteiro"></span>
//   <p data-atualizado="grupo"></p>  → "atualizado em DD/MM/AAAA" (ou mês/ano)
(function () {
  'use strict';
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  function decimal(n) {
    return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  }

  // extenso: 18,5 milhões · 51 mil   curto: 4,5 mi · 51 mil   inteiro: 16
  function formatar(item, formato) {
    const v = Number(item.valor);
    if (!Number.isFinite(v)) return '—';
    let texto;
    if (formato === 'inteiro' || Math.abs(v) < 1000) texto = v.toLocaleString('pt-BR');
    else if (Math.abs(v) >= 1e6) texto = decimal(v / 1e6) + (formato === 'curto' ? ' mi' : (v / 1e6 >= 2 ? ' milhões' : ' milhão'));
    else texto = decimal(v / 1e3) + ' mil';
    return (item.aproximado ? '~' : '') + texto;
  }

  // "2026-09" → "set/2026"; "2026-09-06" → "06/09/2026"
  function formatarData(data) {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(data || '');
    if (!m) return data || '';
    return m[3] ? `${m[3]}/${m[2]}/${m[1]}` : `${MESES[Number(m[2]) - 1]}/${m[1]}`;
  }

  function buscar(dados, caminho) {
    return caminho.split('.').reduce((obj, chave) => (obj ? obj[chave] : undefined), dados);
  }

  fetch('/data/numeros.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(dados => {
      document.querySelectorAll('[data-numero]').forEach(node => {
        const item = buscar(dados, node.dataset.numero);
        if (item) node.textContent = formatar(item, node.dataset.formato);
      });
      document.querySelectorAll('[data-atualizado]').forEach(node => {
        const grupo = dados[node.dataset.atualizado] || {};
        const datas = Object.values(grupo).map(item => item && item.data).filter(Boolean).sort();
        if (datas.length) node.textContent = 'atualizado em ' + formatarData(datas[datas.length - 1]);
      });
    })
    .catch(() => {
      document.querySelectorAll('[data-numero]').forEach(node => { node.textContent = '—'; });
    });
})();
