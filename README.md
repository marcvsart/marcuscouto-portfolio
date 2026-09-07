# Marcus Couto — portfólio profissional

Atualização visual de setembro de 2026, aproximando o portfólio de direção de arte do universo Marcvs.art.

## Publicar no GitHub Pages

1. Faça uma cópia da versão atual do repositório.
2. Extraia este ZIP e copie o conteúdo da pasta `marcuscouto-portfolio-main` para a raiz do repositório, substituindo os arquivos existentes. Não crie uma subpasta no repositório.
3. Inclua também os novos arquivos `site.css`, `home.css` e `ambient.js`.
4. Confirme a alteração na branch usada pelo GitHub Pages e aguarde a atualização do site.

O arquivo `CNAME` foi preservado. Não há instalação, dependências de build ou mudança de domínio.

## O que mudou

- Home com apresentação compacta e quatro projetos em lombadas expansíveis nativas, acessíveis por teclado e toque.
- Identidade compartilhada entre home e cases: fundo preto, ghost-blue, tipografia pontilhada Doto e textos IBM Plex Mono.
- Cabeçalho com acesso ao portfólio profissional e ao Marcvs.art.
- Casos com contribuição, ficha técnica, descrição e acesso às publicações.
- Zombiebasilisk e Marcvs.art continuam acessíveis na home; Instagram e LinkedIn permanecem no contato.
- Fundo com pixels discretos, desativado quando há preferência por movimento reduzido. A animação pausa quando a aba fica oculta.
- Conteúdo e navegação disponíveis mesmo sem JavaScript. As fontes têm alternativas locais.

## Arquivos alterados / novos

- `index.html`: nova home; textos e projetos em HTML, sem depender de geração por JavaScript.
- `uol-30-years.html`, `stories-from-sao-paulo.html`, `archive-of-fame.html`, `it-happened-like-this.html`: cases atualizados.
- `site.css`: identidade compartilhada, navegação e rodapé.
- `home.css`: home e lombadas.
- `project-page.css`: layout dos cases.
- `ambient.js`: animação de fundo.
- `fade.js`: mantém compatibilidade sem ocultar o conteúdo ou interceptar links.
- `README.md`: estas instruções.

`defrag.js` e `_project-page.css` foram preservados do pacote original, mas não são carregados nesta versão.

## Imagens e conteúdo

O ZIP original contém links do Instagram, sem imagens ou vídeos locais. Esta versão usa os textos e destinos fornecidos, sem miniaturas fictícias nem espaços vazios. Os frames grandes previstos na proposta ainda precisam de imagens dos projetos para serem incluídos.

Para cada projeto, os parágrafos originais, datas e links das publicações foram preservados. A síntese de contribuição usa informações presentes no próprio portfólio. Não foram adicionados créditos ou resultados não fornecidos.

## Verificação realizada

- Cinco páginas HTML com um título principal e uma área principal por página.
- Quatro lombadas nativas e todos os caminhos locais e âncoras conferidos.
- Todos os 14 links de filmes/episódios e descrições originais preservados.
- Sintaxe de `fade.js` e `ambient.js` validada.
- Regras responsivas para desktop e mobile revisadas no código; sem validação visual em navegador nesta entrega.

O pacote não publica alterações automaticamente no site atual.
