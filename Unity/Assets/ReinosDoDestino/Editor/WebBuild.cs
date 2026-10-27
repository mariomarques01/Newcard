#if UNITY_EDITOR
using System;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace ReinosDoDestino.Editor
{
    public static class WebBuild
    {
        [MenuItem("Reinos do Destino/Aplicar configuração Web para iPhone")]
        public static void Configure()
        {
            var target=NamedBuildTarget.WebGL;
            // GitHub Pages cannot attach Content-Encoding to precompressed files.
            PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Gzip;
            PlayerSettings.WebGL.decompressionFallback=true;
            PlayerSettings.WebGL.template="PROJECT:Elemental";
            PlayerSettings.WebGL.dataCaching=true;
            PlayerSettings.WebGL.nameFilesAsHashes=true;
            PlayerSettings.WebGL.exceptionSupport=WebGLExceptionSupport.ExplicitlyThrownExceptionsOnly;
            PlayerSettings.WebGL.debugSymbolMode=WebGLDebugSymbolMode.Off;
            PlayerSettings.WebGL.initialMemorySize=128;
            PlayerSettings.WebGL.maximumMemorySize=512;
            PlayerSettings.WebGL.memoryGrowthMode=WebGLMemoryGrowthMode.Geometric;
            PlayerSettings.stripEngineCode=true;
            PlayerSettings.SetManagedStrippingLevel(target,ManagedStrippingLevel.High);
            PlayerSettings.SetApiCompatibilityLevel(target,ApiCompatibilityLevel.NET_Standard);
            PlayerSettings.SetIl2CppCodeGeneration(target,Il2CppCodeGeneration.OptimizeSize);
            QualitySettings.vSyncCount=0;
            AssetDatabase.SaveAssets();
            Debug.Log($"WebGL: {PlayerSettings.WebGL.compressionFormat}; fallback={PlayerSettings.WebGL.decompressionFallback}; stripping={PlayerSettings.GetManagedStrippingLevel(target)}; memory={PlayerSettings.WebGL.initialMemorySize}–{PlayerSettings.WebGL.maximumMemorySize} MB; template={PlayerSettings.WebGL.template}");
        }
        [MenuItem("Reinos do Destino/Gerar versão Web")]
        public static void Build()
        {
            Debug.Log($"WebGL salvo em disco: compression={PlayerSettings.WebGL.compressionFormat}; fallback={PlayerSettings.WebGL.decompressionFallback}; memory={PlayerSettings.WebGL.initialMemorySize}; stripping={PlayerSettings.GetManagedStrippingLevel(NamedBuildTarget.WebGL)}");
            Configure();
            const string scene="Assets/ReinosDoDestino/Scenes/ElementalArena.unity";
            var report=BuildPipeline.BuildPlayer(new[]{scene},"Builds/WebGL",BuildTarget.WebGL,BuildOptions.None);
            if(report.summary.result!=BuildResult.Succeeded)throw new InvalidOperationException("Build WebGL falhou: "+report.summary.result);
            Debug.Log($"WebGL pronto: {report.summary.totalSize} bytes.");
        }
    }
}
#endif
