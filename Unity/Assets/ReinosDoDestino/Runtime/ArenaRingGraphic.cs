using UnityEngine;

namespace ReinosDoDestino.Unity
{
    // Native uGUI geometry; no custom shader or screen-sized transparent texture.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class ArenaRingGraphic : UnityEngine.UI.MaskableGraphic
    {
        public int segments=64;
        protected override void OnPopulateMesh(UnityEngine.UI.VertexHelper mesh)
        {
            mesh.Clear();int count=Mathf.Max(3,segments);float radius=Mathf.Min(rectTransform.rect.width,rectTransform.rect.height)*.5f;
            for(int i=0;i<=count;i++)
            {
                float a=i*Mathf.PI*2/count;var direction=new Vector2(Mathf.Cos(a),Mathf.Sin(a));
                mesh.AddVert(direction*radius,color,Vector2.zero);mesh.AddVert(direction*(radius-7),color,Vector2.zero);
                if(i==0)continue;int n=i*2;mesh.AddTriangle(n-2,n,n-1);mesh.AddTriangle(n,n+1,n-1);
            }
        }
    }
}
