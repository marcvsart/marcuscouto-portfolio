# marcuscouto.com

Portfólio unificado de Marcus Couto (marcvs). Site estático no GitHub Pages: sem build, sem dependências. O que está no repositório é o que vai ao ar.

## Estrutura

```
/                               index.html (home)
/pesquisa/                      pesquisa/index.html
/projetos/prensa-automata/      projetos/prensa-automata/index.html
/projetos/zombiebasilisk/       projetos/zombiebasilisk/index.html
/projetos/uol/                  projetos/uol/index.html
/arte/                          arte/index.html  (#pintura-cryptoart, #literatura, #som)
/arte/som/                      arte/som/index.html
/sistema/                       sistema/index.html  (arquitetura de automação criativa + consultoria e workshops)
/404.html                       página de erro (o GitHub Pages serve para qualquer endereço inexistente)

uol-30-years.html, stories-from-sao-paulo.html,
archive-of-fame.html, it-happened-like-this.html   redirecionamentos para /projetos/uol/#série
sistemas/*/, fale-comigo/, poetica/*/            redirecionamentos dos endereços anteriores para /projetos/*, /sistema/ e /arte/*

assets/css/tokens.css     tokens (cores, fontes, medidas): o único lugar com valores de cor
assets/css/base.css       estrutura, textura, cabeçalho, rodapé, lombada, glitch dosado
assets/css/arte.css       Arte e Som: bolas, visualizador, coleções, discografia, glitch pleno

assets/js/layout.js       cabeçalho e rodapé de todas as páginas + glitch da marca e dos títulos
assets/js/ambient.js      pixels ambientes (fundo)
assets/js/numeros.js      preenche os números a partir de data/numeros.json
assets/js/filmes.mjs      estante de filmes (ZOMBIEBASILISK)
assets/js/lombada.js      abre a lombada indicada no endereço (/projetos/uol/#archive-of-fame)
assets/js/pinturas.js     bolas e visualizador das pinturas
assets/js/som.js          discografia
assets/js/arte.js         glitch pleno e scramble (Arte e Som)
assets/js/basilisk-field.mjs  campo de pixels da pintura Retrato do Basilisco (Arte e Som)

assets/img/filmes/        frames da estante
assets/img/pinturas/      pinturas em WebP e AVIF (os originais ficam fora do site)
assets/img/og/            imagens de compartilhamento 1200×630, uma por página principal

data/numeros.json         números das páginas
data/filmes.txt           estante de filmes
data/pinturas.txt         pinturas
data/som.json             discografia
```

### Cabeçalho e rodapé

Ficam só em `assets/js/layout.js`. Cada página tem `<header data-site-header></header>`, seguido de `<script src="/assets/js/layout.js"></script>`, e `<footer data-site-footer></footer>`. Para mudar o menu, os links do rodapé ou as coordenadas, edite as listas `NAV` e `FOOTER_LINKS` no início do arquivo.

O seletor `PT | EN` já está no cabeçalho, com EN desabilitado. Cada página tem `<link rel="alternate" hreflang="pt-BR">`; o par em inglês entra quando a versão EN existir.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#080b10` | fundo |
| `--surface` | `#0d1420` | hover, blocos |
| `--surface-2` | `#101a29` | lombada aberta |
| `--ink` | `#e5ebf4` | texto principal |
| `--ink-2` | `#c0cede` | texto corrido |
| `--ink-soft` | `#93a5bb` | metadados |
| `--accent` | `#a9caff` | azul fantasma |
| `--accent-2` | `#c5dcff` | hover de links |
| `--rule` / `--rule-soft` | `#28374b` / `#1a2533` | filetes |

Todos os pares de texto e fundo passam de 6,9:1 (AA exige 4,5:1).

**Tipografia** (Google Fonts, só os pesos usados):
- **Workbench** (com os eixos BLED e SCAN): títulos (frase da home, títulos de página, de seção e de lombada). `--font-title`
- **Doto 900**: índices (01, 02…) e detalhes numéricos (números, datas, anos). `--font-num`
- **IBM Plex Mono 300/400/500**: texto corrido, legendas, metadados. `--font-text`

**Efeitos:**
- Site todo: scanlines, vinheta de tubo, acendimento `tube-on`, pixels ambientes.
- Glitch dosado (fora de Arte): 3 fatias, 3–4px, 0,24s, mais uma fatia em `--accent` defasada. Na marca, dispara ao carregar, a cada 20–40s e no hover. Nos títulos com `data-glitch="hover"`, só no hover.
- Arte e Som: glitch pleno do marcvs.art e scramble nos elementos com `data-node`, mais o campo de pixels do basilisco.
- Com "reduzir movimento" ativado no sistema, todos os efeitos ficam desligados.

### Sigilos e estratos

Cada seção tem um sigilo em pixel (SVG embutido, cor `--accent`): estrela em expansão (Pesquisa), elo (Projetos), engrenagem (Arte e Som) e rede de nós (Sistema). Eles aparecem na lista da home e ao lado do título de cada página. Os desenhos são grades de 13×13 (`#` = pixel aceso); para alterar um sigilo, edite o `<svg class="sigil">` correspondente.

Cada sigilo tem uma animação lenta de brilho (4,8s por ciclo). O atraso de cada pixel fica na variável `--d` do próprio `<rect>`:
- estrela: onda do centro para fora;
- rede: sinal descendo dos nós de cima para os de baixo;
- engrenagem: luz girando em volta do eixo;
- elo: os dois elos respiram alternados.

Com "reduzir movimento" ativado, a animação fica desligada.

A lista da home segue os estratos do marcvs.art:
- o caminho e a profundidade acima de cada título (`/pesquisa · −12m`);
- a textura do Workbench, que muda a cada camada (eixos `BLED` e `SCAN`, classes `.l0` a `.l3`);
- o hover em vídeo invertido;
- o `> ` antes do subtítulo e os itens como árvore (`├─`, `└─`).

### Lombada

`details.lombada` é o único componente de lista expansível (séries da UOL, filme UOL 30 Anos e estante de filmes):

```html
<details class="lombada" id="ancora">
  <summary>
    <span class="lombada-num">01</span>
    <span class="lombada-id"><span class="lombada-titulo">Título</span><span class="lombada-tipo">tipo</span></span>
    <span class="lombada-meta num">2026</span>
    <span class="lombada-toggle"></span>
  </summary>
  <div class="lombada-painel">…</div>
</details>
```

## Dados

### data/numeros.json

Cada número é um objeto com `valor` (número puro), `fonte` e `data` (`AAAA-MM` ou `AAAA-MM-DD`). `aproximado: true` mostra `~` antes do valor. As páginas formatam sozinhas: 18500000 vira "18,5 milhões" (ou "18,5 mi" com `data-formato="curto"`), e 51000 vira "51 mil".

A linha "atualizado em" usa a data mais recente do grupo. `AAAA-MM-DD` aparece como `DD/MM/AAAA`; `AAAA-MM` aparece como `mês/AAAA`.

Uma GitHub Action pode sobrescrever o arquivo inteiro, desde que mantenha as chaves (`prensa_automata.edicoes_publicadas`, `zombiebasilisk.tiktok_visualizacoes` etc.). Basta atualizar `valor`, `fonte` e `data`. No HTML, cada número é um `<span data-numero="grupo.chave">`.

### Adicionar um filme

1. Suba o frame em `assets/img/filmes/` (JPG ou WebP, nome simples em minúsculas).
2. Acrescente uma linha em `data/filmes.txt`:

```text
arquivo.jpg | Título | Data | palavra-chave, palavra-chave | https://url-do-video | 50% 30% | Descrição curta | Texto do link | short film | Créditos
```

Os cinco primeiros campos são obrigatórios. Crop, descrição, texto do link (padrão: "Assistir ao filme"), tipo e créditos são opcionais. A ordem das linhas é a ordem da estante; uma linha começando com `#` sai do site.

### Adicionar uma pintura

1. Gere quatro arquivos em `assets/img/pinturas/`, todos com o mesmo nome-base:
   - `nome-orb.webp` e `nome-orb.avif`: até 1600px no lado maior.
   - `nome-full.webp` e `nome-full.avif`: até 2400px.
2. Acrescente em `data/pinturas.txt`:

```text
nome | título | técnica e ano | https://link-para-colecionar
```

Use texto simples (sem HTML). O link é opcional e precisa começar com `https://`.

### Adicionar um texto

Ensaios (`/pesquisa/`) e literatura (`/arte/#literatura`) ficam no HTML de cada página, numa lista `<ul class="entries">`. Copie um `<li class="entry">` existente e troque título, link e data. Na home, os títulos de Pesquisa e Arte ficam em `index.html`.

### Adicionar um lançamento

Acrescente um item ao grupo correspondente em `data/som.json`, com os campos `titulo`, `artista` (opcional), `notas`, `tipo`, `ano` e `url`.

## Domínio e analytics

- `CNAME`: `marcuscouto.com`. `.nojekyll` publica os arquivos sem processamento.
- GoatCounter (`marcvs.goatcounter.com`) em todas as páginas.

## Testar localmente

```sh
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Os dados são lidos por `fetch`, que não funciona abrindo o HTML direto por `file://`.
