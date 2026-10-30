# Arena 3D nativa — integração Unity com build WebGL

Destino: a versão Unity em `/Newcard/unity/`. Branch: `feat/unity-arena-3d`.

## Implementação

- `scripts/export-unity-arena.mjs` converte o GLB aprovado em malhas nativas, refletindo Z e invertendo a ordem dos triângulos para Unity. O JSON registra o SHA-256 da origem, dez espaços, 13 materiais e 53.228 triângulos. Não depende de importador glTF pago nem de rede no aparelho.
- `ArenaScenery3D` constrói 13 MeshRenderers, uma câmera ortográfica isolada e uma RenderTexture atrás da UI. O shader URP tem iluminação simples, sem sombras, pós-processamento ou texturas adicionais. A câmera renderiza após o layout/redimensionamento e ao retornar ao aplicativo; permanece desativada entre essas ocasiões.
- `ArenaController` conserva o motor C#, salvamento, arrasto, efeitos, magias, mão e cinco comandos. As três criaturas permanecem em cada equipe, com dois espaços vazios adicionais; os campos menores deixam 40% da altura útil livre entre eles.
- O build WebGL nativo foi gerado e copiado para `public/unity`; a versão Unity continua independente da React.

## Validação realizada

- 44 testes Node aprovados, incluindo integridade dos índices, normais, materiais, hash da origem e orçamento do cenário.
- Exportador executado com sucesso.
- TypeScript: `npm run lint`.

## Validação do build local

O Unity 6000.6.7f1 com licença Personal e módulo WebGL compilou o C#, o shader URP e o player WebGL. Os seis testes PlayMode passaram, incluindo `ArenaSceneryTests`, arrasto, ataque, magia, efeitos, controles na área segura e avanço do Player Loop. O build publicado localmente tem 21,4 MiB e passou em `node scripts/publish-unity-web.mjs --check`.

Antes do merge definitivo:

1. Abrir `Unity/`, esperar importação e conferir compilação do C# e do shader.
2. Executar os testes PlayMode, inclusive `ArenaSceneryTests`, e a verificação de combate .NET existente.
3. Conferir câmera, renderização URP, dez espaços e controles no Editor em 390×844 e 375×667; testar retomada após segundo plano.
4. Gerar WebGL com `ReinosDoDestino.Editor.WebBuild.Build` (menu Reinos do Destino → Gerar versão Web).
5. Executar `node scripts/publish-unity-web.mjs`, que copia o novo build e atualiza seu fingerprint.
6. Executar `node scripts/publish-unity-web.mjs --check`; testar no iPhone físico, incluindo arrasto, combate, magias, efeitos, salvamento e retorno do segundo plano.
7. Incluir o build atualizado na mesma branch antes do merge. A verificação do Pages rejeita código Unity modificado sem o build correspondente.

## Build pelo GitHub, inclusive pelo celular

O workflow `.github/workflows/unity-webgl-preview.yml` executa no PR, sem publicar no Pages. Executa os testes Node, TypeScript, exportação reproduzível da geometria e paridade .NET em um job independente, sem licença. Em paralelo, verifica apenas a presença de `UNITY_LICENSE`, `UNITY_EMAIL` e `UNITY_PASSWORD` nos **Repository secrets**; não imprime valores. Com os secrets configurados e o job de validação aprovado, executa os testes Unity PlayMode no Editor 6000.6.7f1, gera WebGL e disponibiliza um artifact para revisão.

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

**Computador já licenciado:** usar Unity **6000.6.7f1 (b22767f04f04)** com **WebGL Build Support**, abrir `Unity/`, executar PlayMode e gerar o build pelo menu indicado acima. Essa alternativa evita armazenar credenciais Unity no GitHub. Na raiz do repositório, executar os dois comandos `publish-unity-web.mjs`, servir `public/` por HTTP e testar `/unity/` antes de enviar o build e seu fingerprint para a branch do PR. Compartilhar somente o build, nunca arquivos de licença ou credenciais.

A prévia do workflow é um artifact para baixar e servir via HTTP; não é uma URL hospedada. A URL pública `https://mariomarques01.github.io/Newcard/unity/` continua correspondendo ao build anterior até a publicação efetiva. Um parâmetro `?v=` não gera nem substitui o build.

## Credenciais cadastradas — tentativa seguinte

Os três secrets passaram a estar disponíveis. O run [40984753013](https://github.com/mariomarques01/Newcard/actions/runs/40984753013) confirmou sua presença, aprovou dados/paridade e iniciou Unity **6000.3.27f1 (672d562a42a7)** no runner Linux.

Antes disso, o test runner `@v4` falhou ao consultar a versão de seu CLI (HTTP 403). O commit `60cded7` fixa o test runner em v4.3.2 e o builder em v4.8.2 por SHA, evitando essa consulta variável.

O bloqueio atual é **autenticação Unity HTTP 401**, com `UnityConnectLoginRequest: Failed to login - please check your username or password`, seguido de `Access token is unavailable` e falha na ativação após cinco tentativas. Não houve importação/compilação do projeto, execução PlayMode ou build. A disponibilidade do Editor está confirmada; a validade do arquivo de licença ainda não foi estabelecida.

Ação mínima: o titular deve conferir que consegue entrar no site Unity com **e-mail e senha digitados**, da mesma conta licenciada no Hub, e atualizar `UNITY_EMAIL`/`UNITY_PASSWORD` diretamente nos Repository secrets. Se o acesso habitual usa Google/Apple, confirmar que existe senha própria da conta Unity. Não alterar nem compartilhar o arquivo de licença com base apenas nesse erro. Após corrigir o login, reexecutar os jobs falhos do run acima.
