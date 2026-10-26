#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using ReinosDoDestino.Unity;

namespace ReinosDoDestino.Editor
{
    public static class ProjectSetup
    {
        [MenuItem("Reinos do Destino/Preparar arena mobile")]
        public static void Prepare()
        {
            if (GraphicsSettings.currentRenderPipeline == null) throw new InvalidOperationException("Abra o projeto com o template Universal 2D (URP).");
            if(Resources.Load<TMPro.TMP_Settings>("TMP Settings")==null)TMPro.TMP_PackageResourceImporter.ImportResources(true,false,false);
            PlayerSettings.companyName="ReinosDoDestino";PlayerSettings.productName="Reinos do Destino";
            PlayerSettings.defaultInterfaceOrientation=UIOrientation.Portrait;
            PlayerSettings.allowedAutorotateToPortrait=true;PlayerSettings.allowedAutorotateToPortraitUpsideDown=false;
            PlayerSettings.allowedAutorotateToLandscapeLeft=false;PlayerSettings.allowedAutorotateToLandscapeRight=false;
            PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android,"com.reinosdodestino.elemental");
            PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS,"com.reinosdodestino.elemental");
            PlayerSettings.colorSpace=ColorSpace.Linear;
            PlayerSettings.defaultScreenWidth=1080;PlayerSettings.defaultScreenHeight=1920;
            QualitySettings.SetQualityLevel(0,true);
            EditorSettings.serializationMode=SerializationMode.ForceText;
            var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("Main Camera",typeof(Camera));camera.tag="MainCamera";
            var cam=camera.GetComponent<Camera>();cam.orthographic=true;cam.clearFlags=CameraClearFlags.SolidColor;cam.backgroundColor=new Color(.035f,.05f,.045f);camera.transform.position=new Vector3(0,0,-10);
            cam.allowHDR=true;
            var cameraData=cam.GetUniversalAdditionalCameraData();cameraData.renderPostProcessing=true;cameraData.volumeLayerMask=1;
            var globalLight=new GameObject("Global 2D Light",typeof(UnityEngine.Rendering.Universal.Light2D));globalLight.GetComponent<UnityEngine.Rendering.Universal.Light2D>().lightType=UnityEngine.Rendering.Universal.Light2D.LightType.Global;
            var volumeObject=new GameObject("Elemental Global Volume",typeof(Volume));var volume=volumeObject.GetComponent<Volume>();volume.isGlobal=true;
            var profile=ScriptableObject.CreateInstance<VolumeProfile>();
            var tone=profile.Add<Tonemapping>();tone.mode.Override(TonemappingMode.ACES);
            var bloom=profile.Add<Bloom>();bloom.intensity.Override(.5f);bloom.threshold.Override(.9f);
            var vignette=profile.Add<Vignette>();vignette.intensity.Override(.2f);
            Directory.CreateDirectory("Assets/ReinosDoDestino/Settings");
            const string profilePath="Assets/ReinosDoDestino/Settings/ElementalVolume.asset";
            var existing=AssetDatabase.LoadAssetAtPath<VolumeProfile>(profilePath);
            if(existing!=null){UnityEngine.Object.DestroyImmediate(profile);profile=existing;}else {AssetDatabase.CreateAsset(profile,profilePath);foreach(var component in profile.components)AssetDatabase.AddObjectToAsset(component,profile);}
            volume.sharedProfile=profile;
            new GameObject("ElementalArena").AddComponent<ArenaController>();
            Directory.CreateDirectory("Assets/ReinosDoDestino/Scenes");
            const string path="Assets/ReinosDoDestino/Scenes/ElementalArena.unity";
            EditorSceneManager.SaveScene(scene,path);EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(path,true)};
            AssetDatabase.SaveAssets();AssetDatabase.Refresh();Debug.Log("Arena preparada. Entre em Play Mode para jogar.");
        }
        public static void PrepareBatch()
        {
            if(Resources.Load<TMPro.TMP_Settings>("TMP Settings")==null)
            {
                AssetDatabase.importPackageCompleted+=OnResourcesImported;
                AssetDatabase.importPackageFailed+=(name,error)=>{Debug.LogError(error);EditorApplication.Exit(1);};
                TMPro.TMP_PackageResourceImporter.ImportResources(true,false,false);
                return;
            }
            FinishBatch();
        }
        static void OnResourcesImported(string name){AssetDatabase.importPackageCompleted-=OnResourcesImported;EditorApplication.delayCall+=FinishBatch;}
        static void FinishBatch(){try{Prepare();EditorApplication.Exit(0);}catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
        public static void BuildLinuxPrototype()
        {
            Prepare();
            var result=BuildPipeline.BuildPlayer(EditorBuildSettings.scenes,"Builds/Linux/ReinosDoDestino",BuildTarget.StandaloneLinux64,BuildOptions.Development);
            if(result.summary.result!=UnityEditor.Build.Reporting.BuildResult.Succeeded)throw new InvalidOperationException("Build Linux falhou.");
        }
        [MenuItem("Reinos do Destino/Abrir arena")]
        public static void Open(){EditorSceneManager.OpenScene("Assets/ReinosDoDestino/Scenes/ElementalArena.unity");}
    }
}
#endif
