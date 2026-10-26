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
