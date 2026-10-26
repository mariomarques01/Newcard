# Reinos do Destino — Ascensão Elemental

O desenvolvimento está sendo migrado para **Unity 6.3 LTS**, mantendo o histórico e as artes do jogo.

➡️ **Abra a pasta [`Unity/`](Unity/README.md) no Unity Hub.** Ela contém o motor de combate em C#, a arena nativa e os testes da migração.

O protótipo React/Vite continua na raiz como referência e para preservar a versão web já publicada. Ele não é usado para renderizar a versão Unity.

Para executar a referência web:

```sh
npm ci
npm run dev
```

Para validar o motor nativo com .NET 8:

```sh
dotnet run --project Unity/Verification/ReinosDoDestino.Verification.csproj -- Unity
```

As instruções de abertura, escopo implementado e próximos passos estão em [`Unity/README.md`](Unity/README.md).
