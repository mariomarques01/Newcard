#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering.Universal;

namespace ReinosDoDestino.Editor
{
    // Preserve the existing 2D renderer for UI/effects and add a native 3D
    // renderer for the imported arena camera. Runs before Editor tests/builds.
    [InitializeOnLoad]
    public static class ArenaRenderingSetup
    {
        const string Path="Assets/Settings/ArenaForwardRenderer.asset";
        static ArenaRenderingSetup(){EditorApplication.delayCall+=Ensure;}
        public static void Ensure()
        {
            if(EditorApplication.isCompiling||EditorApplication.isUpdating){EditorApplication.delayCall+=Ensure;return;}
            var renderer=AssetDatabase.LoadAssetAtPath<UniversalRendererData>(Path);
            bool changed=false;
            if(renderer==null)
            {
                renderer=ScriptableObject.CreateInstance<UniversalRendererData>();renderer.name="ArenaForwardRenderer";
                AssetDatabase.CreateAsset(renderer,Path);changed=true;
            }
            foreach(var guid in AssetDatabase.FindAssets("t:UniversalRenderPipelineAsset"))
            {
                var pipeline=AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(AssetDatabase.GUIDToAssetPath(guid));
                var serialized=new SerializedObject(pipeline);var renderers=serialized.FindProperty("m_RendererDataList");
                if(renderers.arraySize<2){renderers.arraySize=2;changed=true;}
                if(renderers.GetArrayElementAtIndex(1).objectReferenceValue!=renderer)
                {
                    renderers.GetArrayElementAtIndex(1).objectReferenceValue=renderer;changed=true;
                }
                serialized.ApplyModifiedPropertiesWithoutUndo();
            }
            if(changed)AssetDatabase.SaveAssets();
        }
    }
}
#endif
