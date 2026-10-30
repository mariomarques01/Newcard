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

Este ambiente não tem Unity Editor 6000.3.27f1 nem licença Unity. O .NET SDK 8.0.427 foi instalado para verificar o núcleo, mas não compila a apresentação dependente do Editor. Portanto o novo C#/shader não foi compilado, os testes Unity PlayMode não foram executados e o aspecto visual 3D ainda não foi conferido. `ArenaSceneryTests` verifica os lotes, as duas vagas por equipe, os controles e o espaço central quando executado no Editor.

Antes de fazer merge, usar Unity 6000.3.27f1 com módulo WebGL e licença válida:

1. Abrir `Unity/`, esperar importação e conferir compilação do C# e do shader.
2. Executar os testes PlayMode, inclusive `ArenaSceneryTests`, e a verificação de combate .NET existente.
3. Conferir câmera, renderização URP, dez espaços e controles no Editor em 390×844 e 375×667; testar retomada após segundo plano.
4. Gerar WebGL com `ReinosDoDestino.Editor.WebBuild.Build` (menu Reinos do Destino → Gerar versão Web).
5. Executar `node scripts/publish-unity-web.mjs`, que copia o novo build e atualiza seu fingerprint.
6. Executar `node scripts/publish-unity-web.mjs --check`; testar Safari/iPhone, incluindo arrasto, combate, magias, efeitos, salvamento e rotação.
7. Incluir o build atualizado na mesma branch antes do merge. A verificação do Pages rejeita código Unity modificado sem o build correspondente.

## Build pelo GitHub, inclusive pelo celular

O workflow `.github/workflows/unity-webgl-preview.yml` executa no PR, sem publicar no Pages. Executa os testes Node, TypeScript, exportação reproduzível da geometria e paridade .NET em um job independente, sem licença. Em paralelo, verifica apenas a presença de `UNITY_LICENSE`, `UNITY_EMAIL` e `UNITY_PASSWORD` nos **Repository secrets**; não imprime valores. Se estiverem ausentes, termina com mensagem clara antes de baixar o Editor. Com os secrets configurados e o job de validação aprovado, executa os testes Unity PlayMode, gera WebGL e disponibiliza um artifact para revisão. A validade da licença e a disponibilidade da imagem Unity 6000.3.27f1 ainda serão verificadas pelo serviço ao executar.

O dono configura a licença ativada e as credenciais diretamente em GitHub → Settings → Secrets and variables → Actions. Não enviar senha ou licença no chat. Referências do provedor: https://game.ci/docs/github/activation/ e https://game.ci/docs/github/builder/.

Depois da configuração, reexecutar o workflow do PR pelo GitHub Actions. O artifact gerado precisa ser validado no Safari antes de integrar os arquivos em `public/unity` e fazer merge. Esse workflow tem somente `contents: read`: não faz commit, merge ou deploy automaticamente.

## Continuação em 30/10/2026

- Confirmado PR #83 aberto e draft, head `38e79321373103da2ff8ddc4f97403b88c3c244b`, antes de modificar.
- Reexecutado o run `40979810484`: a segunda tentativa confirmou a ausência dos três secrets. A listagem administrativa de secrets via API retorna 403; a evidência é o próprio job de verificação, não uma suposição sobre a configuração.
- Repetidos localmente: 44 testes Node, TypeScript, exportador (13 lotes, 53.228 triângulos) e .NET (98 verificações C#, 8 cenários de paridade TypeScript), todos aprovados.
- Executados os dois comandos de publicação: sem build em `Unity/Builds/WebGL/index.html`, a cópia falha antes de alterar `public/unity`; `--check` rejeita o fingerprint antigo. Nenhum build foi publicado.
- PlayMode, compilação C#/shader pelo Editor, GPU, navegador e Safari/iPhone continuam pendentes. Não há nova URL de prévia validada.

### Caminhos gratuitos para destravar

**GitHub Actions:** a documentação atual do [GameCI para Unity Personal](https://game.ci/docs/github/activation/#personal-license) orienta ativar a licença gratuita no Unity Hub (Preferences → Licenses → Add → Get a free personal license), se a conta for elegível. No computador do titular, localizar o arquivo `Unity_lic.ulf` gerado. Criar `UNITY_LICENSE` (conteúdo do arquivo), `UNITY_EMAIL` e `UNITY_PASSWORD` diretamente em [Repository secrets](https://github.com/mariomarques01/Newcard/settings/secrets/actions). Depois reexecutar os jobs falhos do [workflow](https://github.com/mariomarques01/Newcard/actions/runs/40979810484). A ativação efetiva ainda será verificada pelo Editor; instalar somente o Editor ou usar uma imagem Docker não elimina essa exigência. Não é necessário contratar um serviço para seguir esse caminho.

**Computador já licenciado:** instalar Unity **6000.3.27f1 (672d562a42a7)** com **WebGL Build Support** pelo Hub, abrir `Unity/`, executar PlayMode e gerar o build pelo menu indicado acima. Essa alternativa evita armazenar credenciais Unity no GitHub. Na raiz do repositório, executar os dois comandos `publish-unity-web.mjs`, servir `public/` por HTTP e testar `/unity/` antes de enviar o build e seu fingerprint para a branch do PR. Compartilhar somente o build, nunca arquivos de licença ou credenciais.

A prévia do workflow é um artifact para baixar e servir via HTTP; não é uma URL hospedada. A URL pública `https://mariomarques01.github.io/Newcard/unity/` continua correspondendo ao build anterior até a publicação efetiva. Um parâmetro `?v=` não gera nem substitui o build.
