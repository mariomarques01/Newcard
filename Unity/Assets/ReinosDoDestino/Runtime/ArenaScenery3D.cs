using System;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.UI;

namespace ReinosDoDestino.Unity
{
    /// <summary>Native mesh scenery in a separate camera, behind existing touch UI.</summary>
    public sealed class ArenaScenery3D : MonoBehaviour
    {
        [Serializable] sealed class ArenaData { public string sourceSha256; public int slots; public MeshData[] meshes; }
        [Serializable] sealed class MeshData { public string name; public float[] positions,normals,color,emission; public int[] triangles; }
        const int SceneryLayer=30;
        Camera sceneryCamera;
        RawImage display;
        RenderTexture target;
        GameObject world;
        bool needsRender=true;
        readonly System.Collections.Generic.List<UnityEngine.Object> owned=new System.Collections.Generic.List<UnityEngine.Object>();
        public int BatchCount { get; private set; }
        public void Initialize(RectTransform parent)
        {
            var dataAsset=Resources.Load<TextAsset>("Elemental/Arena/arena");
            var shader=Resources.Load<Shader>("Elemental/Arena/ArenaUnlit");
            if(dataAsset==null||shader==null){Debug.LogError("Arena 3D: mesh data or shader missing.");return;}
            var data=JsonUtility.FromJson<ArenaData>(dataAsset.text);
            if(data.slots!=10||data.meshes==null||data.meshes.Length>16){Debug.LogError("Arena 3D: invalid geometry budget.");return;}
            var imageObject=new GameObject("NativeArena3D",typeof(RectTransform),typeof(RawImage));
            imageObject.transform.SetParent(parent,false);imageObject.transform.SetAsFirstSibling();
            display=imageObject.GetComponent<RawImage>();display.raycastTarget=false;
            var rect=display.rectTransform;rect.anchorMin=new Vector2(0,.245f);rect.anchorMax=new Vector2(1,.865f);rect.offsetMin=rect.offsetMax=Vector2.zero;
            world=new GameObject("Arena3DWorld");world.transform.SetParent(transform,false);
            world.transform.position=new Vector3(1000,0,0);world.layer=SceneryLayer;
            foreach(var batch in data.meshes)
            {
                var mesh=new Mesh {name="Arena_"+batch.name,indexFormat=IndexFormat.UInt32};
                var vertices=new Vector3[batch.positions.Length/3];var normals=new Vector3[vertices.Length];
                for(int i=0;i<vertices.Length;i++)
                {
                    int n=i*3;vertices[i]=new Vector3(batch.positions[n],batch.positions[n+1],batch.positions[n+2]);
                    normals[i]=new Vector3(batch.normals[n],batch.normals[n+1],batch.normals[n+2]);
                }
                mesh.vertices=vertices;mesh.normals=normals;mesh.triangles=batch.triangles;mesh.RecalculateBounds();mesh.UploadMeshData(true);owned.Add(mesh);
                var material=new Material(shader);material.SetColor("_BaseColor",new Color(batch.color[0],batch.color[1],batch.color[2],batch.color[3]));
                material.SetColor("_Emission",new Color(batch.emission[0],batch.emission[1],batch.emission[2],1));owned.Add(material);
                var model=new GameObject(batch.name,typeof(MeshFilter),typeof(MeshRenderer));model.layer=SceneryLayer;model.transform.SetParent(world.transform,false);
                model.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=model.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;
                BatchCount++;
            }
            var cameraObject=new GameObject("ArenaSceneryCamera",typeof(Camera));cameraObject.transform.SetParent(world.transform,false);
            sceneryCamera=cameraObject.GetComponent<Camera>();sceneryCamera.orthographic=true;sceneryCamera.clearFlags=CameraClearFlags.SolidColor;
            sceneryCamera.backgroundColor=new Color(.035f,.065f,.075f);sceneryCamera.cullingMask=1<<SceneryLayer;sceneryCamera.allowHDR=false;sceneryCamera.allowMSAA=false;sceneryCamera.nearClipPlane=.1f;sceneryCamera.farClipPlane=100;
            cameraObject.transform.localPosition=new Vector3(0,35,-24);cameraObject.transform.LookAt(world.transform.position);
            sceneryCamera.enabled=false;
        }
        void LateUpdate()
        {
            if(display==null||sceneryCamera==null)return;
            var size=display.rectTransform.rect.size;
            if(size.x<=0||size.y<=0)return;
            float aspect=size.x/size.y;
            int height=Mathf.Clamp(Mathf.RoundToInt(Screen.height*.62f),256,1024);
            int width=Mathf.Clamp(Mathf.RoundToInt(height*aspect),128,1024);
            if(target!=null&&target.IsCreated()&&target.width==width&&target.height==height&&!needsRender)return;
            needsRender=false;
            sceneryCamera.enabled=false;
            if(target!=null){sceneryCamera.targetTexture=null;target.Release();Destroy(target);}
            target=new RenderTexture(width,height,16,RenderTextureFormat.ARGB32){name="Arena3DPreview",antiAliasing=1};target.Create();
            display.texture=target;sceneryCamera.targetTexture=target;sceneryCamera.aspect=(float)width/height;
            sceneryCamera.orthographicSize=Mathf.Max(19.5f,13/sceneryCamera.aspect);
            // Camera is enabled for one frame after resize. Static scenery has no ongoing GPU loop.
            sceneryCamera.enabled=true;StartCoroutine(StopCameraAfterFrame());
        }
        System.Collections.IEnumerator StopCameraAfterFrame(){yield return new WaitForEndOfFrame();if(sceneryCamera!=null)sceneryCamera.enabled=false;}
        void OnApplicationFocus(bool focused){if(focused)needsRender=true;}
        void OnApplicationPause(bool paused){if(!paused)needsRender=true;}
        void OnDestroy()
        {
            if(sceneryCamera!=null)sceneryCamera.targetTexture=null;
            if(target!=null){target.Release();Destroy(target);}
            foreach(var item in owned)if(item!=null)Destroy(item);
            if(world!=null)Destroy(world);
        }
    }
}
