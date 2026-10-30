# Arena 3D — versão para aprovação

Branch: `feat/arena-3d-preview`. Não fazer merge nem publicar no GitHub Pages antes da aprovação.

## Análise e integração

O jogo usa React 19/Vite, com regras e estado em `src/App.tsx`, funções elementais em `src/game` e alvos HTML em `MobileArena`. A integração mantém esses caminhos, salvamento, campanha, evolução, decks, magias e ações. As três criaturas existentes continuam em cada equipe; os cinco espaços são visuais, com dois vazios, sem acrescentar criaturas ou mudar o balanceamento.

`Arena3D` carrega Three.js sob demanda e o GLB local exportado da revisão 2 de https://higgsfield.ai/3d-jutsu/c1fe1f88-ccbf-4bc4-830c-875ebcf652f6. O asset contém 53.228 triângulos e é agrupado por seus 13 materiais em 13 lotes estáticos. A câmera ortográfica conserva o cenário completo; a resolução é limitada a 1,5×. Não há loop de animação ou sombras dinâmicas. O canvas não intercepta toques. Carregamento, falha de WebGL ou perda de contexto preservam a imagem de referência e os controles HTML.

O CSS final substitui os conflitos do layout anterior: seis linhas de interface, cartas pequenas, cinco espaços por jogador, centro amplo, controles dentro da viewport e safe areas do iPhone. Informações detalhadas permanecem nos botões de inspeção.

## Validação

- `npm run lint`: passou.
- `node --import tsx --test tests/*.test.ts`: 43 testes, incluindo leitura real do GLB, slots, decks, orçamento de geometria e agrupamento de materiais.
- `npm run build`: passou; Three.js fica em chunk separado. Vite informa chunk 3D maior que 500 kB, carregado sob demanda.
- Navegador: inspeção visual em frames de 390×844 e 375×667; ataque e magia mantêm bloqueio durante animação, gasto de energia e descarte.
- Limite: WebGL desativado no navegador remoto. A renderização GPU, restauração de contexto e desempenho real no Safari/iPhone precisam de aprovação no aparelho. A leitura e o agrupamento do GLB foram verificados em Node; o fallback foi verificado visualmente.

## Aprovação no iPhone

Abrir a versão isolada, conferir cenário/legibilidade, selecionar criaturas, atacar, defender, usar magias/habilidade, encerrar turno e reabrir a partida salva. Conferir retrato e rotação. A main e o GitHub Pages continuam sem alterações.
