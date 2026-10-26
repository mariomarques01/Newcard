# Ascensão Elemental

A arena agora usa Fogo, Água, Terra e Ar, seis criaturas e uma mão inicial com as quatro magias enviadas pelo usuário. Os valores impressos nas cartas mais recentes prevalecem sobre a primeira referência da arena.

- Dragão Ígneo: 12 de vida, 4 de ataque, 2 de defesa. Sopro Flamejante: 4 de dano ao alvo e 1 aos demais inimigos vivos.
- Leviatã Aquático: 10/3/3. Maré Impactante: 3 de dano ao alvo e −1 de ataque em todos os inimigos por uma rodada.
- Golem de Pedra: 11/2/4. Baluarte Terreno: +2 de escudo próprio e +1 a um aliado vivo.
- Grifo do Vento: 9/4/3. Investida Aérea: 3 de dano ao alvo e +1 de ataque próprio por uma rodada.
- Explosão Ígnea: custo 1, dano direto 4.
- Onda Avassaladora: custo 2, dano direto 3 a todos os inimigos e −1 de ataque por uma rodada.
- Erupção Terrestre: custo 3, dano direto 4 e −2 de defesa por uma rodada.
- Tornado Ventoso: custo 4, dano direto 4 e impede o ataque por uma rodada.

Ent Ancestral e Lobo Flamejante permanecem da composição inicial. O Ent concede 2 de escudo inicial à corte. As magias de cura, armadura e tempestade da referência inicial continuam no baralho, usando ilustrações dos respectivos elementos. As oito artes enviadas estão preservadas integralmente em `public/assets/elemental/*.jpg`; a arena exibe uma janela delas e os detalhes permitem consultar as cartas. A imagem `creatures.png`, gerada para esta implementação, fornece as ilustrações do Ent e do Lobo.

As reduções temporárias expiram após o turno da corte afetada, sem restaurar alterações permanentes. O bônus do Grifo termina no início da próxima rodada. Escudo e defesa são exibidos separadamente. Habilidades custam 2 de energia; o rival também pode usá-las. Os saves elementais usam uma chave própria para evitar recuperar partidas antigas incompatíveis.

## Validação

- `npm run lint`
- `npm run build`
- `node --import tsx --test tests/*.test.ts`: nove arquivos de teste passaram, incluindo regressões e os novos cenários elementais.
- Chromium automatizado: quatro magias, habilidade do Grifo, filtragem da coleção, transição de turno, recarga e recuperação da partida. Sem erros de JavaScript.
- Inspeção visual em 390 × 844 e 960 × 1280; capturas nesta pasta.

## Execução

`npm install`, depois `npm run dev`. O ajuste da dependência esbuild resolve o conflito de instalação com o Vite 8 presente no projeto.

## Efeitos exclusivamente elementais

Ataques, defesas, magias, habilidades e evolução usam o elemento da carta/criatura e as artes elementais atuais. A animação não carrega mais `royal-actions.webp`; símbolos, anúncios e falas do baralho tradicional foram removidos desse fluxo. Os anúncios de poderes leem os resultados da mesma resolução de combate, incluindo dano em área, escudos e cura efetivamente aplicados.

Validação adicional em Chromium: as quatro magias produzem `data-school` do elemento correto e anunciam a arte da carta usada; ataque, defesa e habilidade do Grifo mostram sua arte elemental; o rival anuncia suas habilidades elementais. Nenhuma requisição a `royal-actions` ou `assets/aistudio`, sem erros de JavaScript. A compilação e os testes de regressão também passaram.

## Evolução das magias e habilidades

As sete magias agora possuem coreografias próprias: bola de fogo e brasas, onda em camadas, fonte de cura, armadura de placas rochosas, erupção com pilares e fissuras, tornado vertical e lâminas de vento. A renovação do Ent usa folhas ascendentes e cura; barreiras defensivas acompanham o elemento da criatura. Onda Avassaladora também marca a área da corte adversária, sem atingir visualmente os aliados.

Criaturas exibem os modificadores reais ainda ativos: ataque/defesa reduzidos, ataque aumentado e ataque impedido, com duração de um turno e descrição acessível. Modificadores ofensivos e atributos chegam visualmente junto ao impacto. A seleção destaca todos os alvos de magias em área e informa efeitos secundários antes de jogar. Todas as magias protegem a resolução da animação contra novas ações simultâneas.

Os números de dano ficam junto ao alvo, em vez de aparecerem no topo da tela. A preferência por movimento reduzido remove projéteis e animações intensas e mantém a informação do resultado. O custo, o dano, a cura, a defesa e as regras impressas nas cartas foram preservados.

Validação: TypeScript, build e dez arquivos de teste passaram. Chromium verificou as sete magias, renovação do Ent, barreira do Grifo, chegada dos indicadores no impacto, término do bloqueio de ataque e movimento reduzido; sem erros de JavaScript. As capturas `wave-evolved.png` e `tornado-evolved.png` mostram cenários automatizados de teste.

## Arena com foco nas criaturas

Remodela o layout para impedir o achatamento das cartas quando o navegador reduz a altura disponível. As criaturas têm uma janela de arte independente, com enquadramento ampliado; nome e atributos ficam em um rodapé próprio. Vida, elemento, escudo e informações não dependem dos valores impressos na imagem. As animações usam o mesmo enquadramento das cartas da arena.

O placar foi compactado e impede a quebra dos valores de PG. As seis criaturas mantêm proporções e altura mínima; em telas baixas a página pode rolar em vez de reduzir a arte a uma faixa. O layout também deixa de herdar as duas colunas antigas em paisagem.

Validação em Chromium: 320×640, 390×844, 393×695, 430×932, 960×1280 e 1280×800. Todas as cartas medem no mínimo 175 px de altura; em 393×695 medem aproximadamente 193 px, com 129 px exclusivos para a arte. Sem corte horizontal, quebra interna do placar ou sobreposição do placar com a legenda. Seleção, ataque, magia em área, indicadores e troca de turno passaram sem erros de JavaScript. TypeScript, build e dez arquivos de testes passaram. Capturas: `creatures-mobile-remodel.png` e `creatures-desktop-remodel.png`.
