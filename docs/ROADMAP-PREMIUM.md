# Newcard — plano de evolução premium mobile

## Diagnóstico (outubro de 2026)
O projeto já dispõe de heróis, naipes, cartas de ação, energia, combate por turnos, campanha, relíquias, seleção de alvos, canvas de partículas e efeitos de magia. Não reescrever essas bases sem testes.

## Etapa 1 — fundação visual (V55)
- Refinar sinais de carta selecionada, alvo válido, custo insuficiente, escudo e HP.
- Documentar identidade mágica de cada naipe com metadados puros de apresentação.
- Preservar redução de movimento para acessibilidade.

## Etapa 2 — profundidade de feitiços
- Introduzir escolas de magia por naipe: aço (espadas), natureza (copas), solar (ouros), tempestade (paus) e caos (coringas).
- Ligar cada escola ao SpellScene e ao áudio, com atlas de partículas próprio, impacto, pós-brilho e duração calibrada.
- Regras sempre processadas antes da apresentação, sem alterar resultados por causa da animação.

## Etapa 3 — sensação tátil
- Drag-and-drop acessível com cancelamento e preview consistente.
- Alvos e validação de recurso inequívocos; nenhuma ação inválida consome carta ou energia.
- Ajustar safe areas, telas pequenas, 60 fps alvo e modo de poucos efeitos.

## Etapa 4 — balanceamento e profundidade
- Testar efeitos de cartas, custos, sinergias e passivas dos 12 personagens.
- Adicionar combinações entre naipes e palavras-chave novas apenas com testes de regra e IA do rival.
- Telemetria opcional, testes automatizados e QA em Android/iOS.

## Critérios de aceite
npm run lint; npm run build; testar em viewport móvel e orientação retrato; preservar saves locais, capacidades existentes e controles por toque.

## Integridade criativa
Inspirar-se na clareza, no ritmo e no feedback de jogos de cartas premium. Não reutilizar nomes, ícones, artes, sons ou UI proprietária de outros jogos.
