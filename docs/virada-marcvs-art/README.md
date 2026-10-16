# Virada do marcvs.art → marcuscouto.com/arte/

Kit para o marcvs.art passar a levar à página Marcvs (`/arte/`) do site unificado, com cada endereço antigo apontando para o equivalente novo.

## Como está hoje

- **DNS:** marcvs.art e marcuscouto.com usam o DNS do registrador (Namecheap, `registrar-servers.com`) e apontam para o GitHub Pages. Não há Cloudflare.
- **marcvs.art:** é servido pelo repositório `marcvsart/marcvsart` (arquivo `CNAME` = `marcvs.art`).
- **Consequência:** a virada não exige mexer no DNS. Basta trocar o conteúdo do repositório `marcvsart` pelas páginas de redirecionamento desta pasta.

## Mapa de endereços

Também está em [`mapa.csv`](mapa.csv).

| marcvs.art | vai para |
|---|---|
| `/` | `/arte/` |
| `/portraits-of-the-basilisk.html` | `/arte/#pintura-cryptoart` |
| `/cryptoart.html` | `/arte/#pintura-cryptoart` |
| `/imagem.html`, `/visuals.html` | `/arte/#pintura-cryptoart` |
| `/som.html` | `/arte/som/` (mantém a âncora: `#osasco-dynamics` continua funcionando) |
| `/texto.html` | `/arte/#literatura` |
| `/bio.html` | `/` (home, com a apresentação) |
| `/films/*` | `/projetos/zombiebasilisk/#filmes` |
| `/paintings/*` | `/arte/#pintura-cryptoart` |
| qualquer outro | `/arte/` (via `404.html`) |

## Passo a passo

1. **Confira o site novo.** A página `/arte/` (Marcvs) precisa estar publicada no marcuscouto.com.
2. **Faça um backup do repositório `marcvsart/marcvsart`.** Uma tag basta, por exemplo `antes-da-virada`, para poder voltar se precisar.
3. **Substitua o conteúdo do repositório `marcvsart`** pelos arquivos da pasta [`marcvsart/`](marcvsart/):
   - `index.html`, `bio.html`, `cryptoart.html`, `imagem.html`, `visuals.html`, `som.html`, `texto.html`, `portraits-of-the-basilisk.html`, `404.html`;
   - `CNAME` (continua `marcvs.art`) e `.nojekyll`.

   Pode apagar o resto: `films/`, `paintings/`, CSS, JS, `og.png`, `README.md`. As imagens já estão copiadas no site novo, e qualquer endereço apagado cai no `404.html`, que também redireciona.
4. **Ative "Enforce HTTPS"** em Settings → Pages do repositório `marcvsart`. Hoje `http://marcvs.art` não redireciona para `https`.
5. **Teste no navegador**, alguns minutos depois do publish:
   - `https://marcvs.art/` → `https://marcuscouto.com/arte/`
   - `https://marcvs.art/som.html#osasco-dynamics` → `https://marcuscouto.com/arte/som/#osasco-dynamics`
   - `https://marcvs.art/portraits-of-the-basilisk.html` → `https://marcuscouto.com/arte/#pintura-cryptoart`
   - `https://marcvs.art/qualquer-coisa` → `https://marcuscouto.com/arte/`
6. **Perfis e bios.** Os links que apontam para marcvs.art (Instagram, objkt, Transient, Manifold etc.) podem ficar como estão, porque redirecionam. Se quiser, troque aos poucos por `marcuscouto.com/arte/`.

## Como os redirecionamentos funcionam

O GitHub Pages não faz redirecionamento 301 no servidor. Por isso cada página usa três recursos:

- um script que redireciona na hora e preserva a âncora (`#…`) quando o destino não tem uma;
- `meta refresh` como reserva, para quem está sem JavaScript;
- `canonical` apontando para o endereço novo, para os buscadores transferirem a relevância, e `noindex`, para as páginas antigas saírem do índice.

Cada página também conta a visita no GoatCounter do marcvs (`marcvs.goatcounter.com`), para você ver quanto tráfego ainda chega pelo domínio antigo.

**Mais adiante (opcional):** para ter um 301 de verdade, dá para colocar o marcvs.art atrás do Cloudflare e usar uma regra de redirecionamento com o mesmo mapa. Não é necessário para a virada.

## Regenerar este kit

Os arquivos foram gerados por um script local, a partir do mapa acima. Para mudar um destino, edite a página correspondente em `marcvsart/` e a linha em `mapa.csv`.
