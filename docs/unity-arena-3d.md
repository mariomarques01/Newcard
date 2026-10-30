# Arena 3D nativa — integração Unity pendente de build

Destino: a versão Unity em `/Newcard/unity/`. Branch: `feat/unity-arena-3d`.

## Implementação

- `scripts/export-unity-arena.mjs` converte o GLB aprovado em malhas nativas, refletindo Z e invertendo a ordem dos triângulos para Unity. O JSON registra o SHA-256 da origem, dez espaços, 13 materiais e 53.228 triângulos. Não depende de importador glTF pago nem de rede no aparelho.
- `ArenaScenery3D` constrói 13 MeshRenderers, uma câmera ortográfica isolada e uma RenderTexture atrás da UI. O shader URP tem iluminação simples, sem sombras, pós-processamento ou texturas adicionais. A câmera renderiza após o layout/redimensionamento e ao retornar ao aplicativo; permanece desativada entre essas ocasiões.
- `ArenaController` conserva o motor C#, salvamento, arrasto, efeitos, magias, mão e cinco comandos. As três criaturas permanecem em cada equipe, com dois espaços vazios adicionais; os campos menores deixam 40% da altura útil livre entre eles.
- O build existente em `public/unity` não foi substituído, nem redirecionado para React.

## Validação realizada

- 44 testes Node aprovados, incluindo integridade dos índices, normais, materiais, hash da origem e orçamento do cenário.
- Exportador executado com sucesso.
- TypeScript: `npm run lint`.

## Validação ainda obrigatória

Este ambiente não tem Unity Editor 6000.3.27f1 nem .NET CLI. Portanto o novo C#/shader não foi compilado, os testes Unity PlayMode não foram executados e o aspecto visual 3D ainda não foi conferido. `ArenaSceneryTests` verifica os lotes, as duas vagas por equipe, os controles e o espaço central quando executado no Editor.

Antes de fazer merge, usar Unity 6000.3.27f1 com módulo WebGL e licença válida:

1. Abrir `Unity/`, esperar importação e conferir compilação do C# e do shader.
2. Executar os testes PlayMode, inclusive `ArenaSceneryTests`, e a verificação de combate .NET existente.
3. Conferir câmera, renderização URP, dez espaços e controles no Editor em 390×844 e 375×667; testar retomada após segundo plano.
4. Gerar WebGL com `ReinosDoDestino.Editor.WebBuild.Build` (menu Reinos do Destino → Gerar versão Web).
5. Executar `node scripts/publish-unity-web.mjs`, que copia o novo build e atualiza seu fingerprint.
6. Executar `node scripts/publish-unity-web.mjs --check`; testar Safari/iPhone, incluindo arrasto, combate, magias, efeitos, salvamento e rotação.
7. Incluir o build atualizado na mesma branch antes do merge. A verificação do Pages rejeita código Unity modificado sem o build correspondente.
