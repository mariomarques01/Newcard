using UnityEngine;
using ReinosDoDestino.Core;

namespace ReinosDoDestino.Unity
{
    public enum ElementalVfxPhase { Origin, Travel, Impact, Ward }
    public enum ElementalVfxAction { Strike, Guard, Heal, Empower }

    // Each element has its own silhouettes and motion, including a separate defensive form.
    // Meshes use the standard UI material, so the same presentation runs on mobile WebGL.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class ElementalVfxGraphic : UnityEngine.UI.MaskableGraphic
    {
        public Element Element { get; private set; }
        public ElementalVfxPhase Phase { get; private set; }
        public ElementalVfxAction Action { get; private set; }
        public float Duration { get; private set; }
        float elapsed, nextFrame;
        UnityEngine.UI.VertexHelper mesh;
        float age, alpha, w, h;
        const float Tau=Mathf.PI*2;
        public void Initialize(Element element,ElementalVfxPhase phase,ElementalVfxAction action,float duration)
        {
            Element=element;Phase=phase;Action=action;Duration=duration;elapsed=0;nextFrame=0;
            raycastTarget=false;SetVerticesDirty();
        }
        void Update()
        {
            elapsed+=ArenaController.PresentationDelta;
            if(Duration>0&&elapsed>=Duration){Destroy(gameObject);return;}
            if(Time.unscaledTime<nextFrame)return;
            nextFrame=Time.unscaledTime+(Phase==ElementalVfxPhase.Ward?1f/20:1f/30);SetVerticesDirty();
        }
        protected override void OnPopulateMesh(UnityEngine.UI.VertexHelper helper)
        {
            helper.Clear();mesh=helper;age=elapsed;
            w=rectTransform.rect.width;h=rectTransform.rect.height;
            if(w<1||h<1)return;
            alpha=Phase==ElementalVfxPhase.Ward?.82f:Duration>0?Mathf.Clamp01((Duration-age)/.6f):1;
            if(Phase==ElementalVfxPhase.Origin)alpha*=Mathf.Clamp01(age/.06f);
            switch(Element)
            {
                case Element.Fire: Fire();break;
                case Element.Water: Water();break;
                case Element.Earth: Earth();break;
                case Element.Air: Air();break;
            }
        }
        Color Ink(float r,float g,float b,float a=1){return new Color(r,g,b,a*alpha);}
        void Polygon(Vector2[] points,Color edge,Color core)
        {
            Vector2 center=Vector2.zero;foreach(var p in points)center+=p;center/=points.Length;
            int start=mesh.currentVertCount;mesh.AddVert(center,core,Vector2.zero);
            foreach(var p in points)mesh.AddVert(p,edge,Vector2.zero);
            for(int i=0;i<points.Length;i++)mesh.AddTriangle(start,start+1+i,start+1+(i+1)%points.Length);
        }
        void Disc(Vector2 center,float rx,float ry,Color core,Color edge,int count=20)
        {
            int start=mesh.currentVertCount;mesh.AddVert(center,core,Vector2.zero);
            for(int i=0;i<=count;i++){float a=Tau*i/count;mesh.AddVert(center+new Vector2(Mathf.Cos(a)*rx,Mathf.Sin(a)*ry),edge,Vector2.zero);if(i>0)mesh.AddTriangle(start,start+i,start+i+1);}
        }
        void Line(Vector2 a,Vector2 b,float width,Color c)
        {
            Vector2 n=new Vector2(-(b-a).y,(b-a).x).normalized*width*.5f;int start=mesh.currentVertCount;
            mesh.AddVert(a-n,c,Vector2.zero);mesh.AddVert(a+n,c,Vector2.zero);mesh.AddVert(b+n,c,Vector2.zero);mesh.AddVert(b-n,c,Vector2.zero);
            mesh.AddTriangle(start,start+1,start+2);mesh.AddTriangle(start,start+2,start+3);
        }
        void Arc(Vector2 center,float rx,float ry,float start,float length,float rotation,float width,Color c,int count=28)
        {
            Vector2 last=Vector2.zero;float cr=Mathf.Cos(rotation),sr=Mathf.Sin(rotation);
            for(int i=0;i<=count;i++)
            {
                float a=start+length*i/count;var p=new Vector2(Mathf.Cos(a)*rx,Mathf.Sin(a)*ry);p=center+new Vector2(p.x*cr-p.y*sr,p.x*sr+p.y*cr);
                if(i>0)Line(last,p,width,c);last=p;
            }
        }
        void Flame(Vector2 foot,float width,float height,float seed,float opacity=1)
        {
            float sway=Mathf.Sin(age*12+seed)*width*.35f;
            Polygon(new[]{foot+new Vector2(-width*.5f,0),foot+new Vector2(-width*.58f,height*.3f),foot+new Vector2(-width*.2f+sway,height*.63f),foot+new Vector2(sway,height),foot+new Vector2(width*.19f,height*.48f),foot+new Vector2(width*.55f,height*.24f),foot+new Vector2(width*.46f,0)},Ink(1,.11f,.015f,opacity*.9f),Ink(1,.69f,.03f,opacity));
            Polygon(new[]{foot+new Vector2(-width*.2f,0),foot+new Vector2(-width*.2f,height*.27f),foot+new Vector2(sway*.5f,height*.65f),foot+new Vector2(width*.23f,height*.2f),foot+new Vector2(width*.2f,0)},Ink(1,.65f,.02f,opacity),Ink(1,1,.55f,opacity));
        }
        void Drop(Vector2 p,float size,float opacity=1)
        {
            Polygon(new[]{p+new Vector2(0,size*1.5f),p+new Vector2(-size*.65f,0),p+new Vector2(-size*.35f,-size*.65f),p+new Vector2(size*.35f,-size*.65f),p+new Vector2(size*.65f,0)},Ink(.02f,.45f,1,opacity),Ink(.65f,1,1,opacity));
        }
        void Rock(Vector2 p,float size,float seed,float opacity=1)
        {
            var points=new Vector2[6];for(int i=0;i<6;i++){float a=Tau*i/6+seed;points[i]=p+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*(size*(.8f+.15f*Mathf.Sin(i*7+seed)));}
            Polygon(points,Ink(.2f,.12f,.055f,opacity),Ink(.65f,.47f,.22f,opacity));
            Line(p+new Vector2(-size*.45f,size*.2f),p+new Vector2(0,-size*.15f),2.5f,Ink(.55f,1,.2f,opacity));
            Line(p+new Vector2(0,-size*.15f),p+new Vector2(size*.45f,size*.4f),2,Ink(.55f,1,.2f,opacity));
        }
        void Leaf(Vector2 p,float size,float rotation,Color color)
        {
            Vector2 direction=new Vector2(Mathf.Cos(rotation),Mathf.Sin(rotation))*size,n=new Vector2(-direction.y,direction.x)*.23f;
            Polygon(new[]{p-direction,p+n,p+direction,p-n},color,Ink(.85f,1,.8f,color.a));
        }
        bool Barrier { get { return Action==ElementalVfxAction.Guard||Phase==ElementalVfxPhase.Ward; } }
        void Fire()
        {
            bool warm=Action==ElementalVfxAction.Heal||Action==ElementalVfxAction.Empower;
            if(Phase==ElementalVfxPhase.Travel)
            {
                // The graphic's local X axis is the flight direction, with the tail behind it.
                for(int i=0;i<13;i++){float f=i/12f;var p=new Vector2(w*(.43f-f*.9f),Mathf.Sin(age*25-i*.8f)*h*.08f);Disc(p,h*(.2f-f*.13f),h*(.3f-f*.2f),Ink(1,.4f,.015f,.75f*(1-f)),Ink(1,.1f,0,0));Flame(p-new Vector2(0,h*.12f),h*(.35f-f*.2f),h*(.6f-f*.36f),i,1-f*.8f);}
                Disc(new Vector2(w*.4f,0),h*.34f,h*.34f,Ink(1,1,.55f),Ink(1,.2f,0,0));return;
            }
            if(warm)
            {
                for(int i=0;i<12;i++){float t=Mathf.Repeat(age*.5f+i*.17f,1);var p=new Vector2(Mathf.Sin(i*9)*w*.4f,-h*.4f+t*h*.8f);Disc(p,8,18,Ink(1,.85f,.2f,1-t),Ink(1,.4f,0,0));}return;
            }
            if(Barrier)
            {
                // A recognizable incandescent shield, distinct from a creature burning after a hit.
                float shieldRise=Mathf.Clamp01(age/.25f);
                var shield=new[]{new Vector2(-w*.36f,h*.3f),new Vector2(w*.36f,h*.3f),new Vector2(w*.34f,-h*.08f),new Vector2(0,-h*.43f),new Vector2(-w*.34f,-h*.08f)};
                for(int i=0;i<shield.Length;i++)shield[i]*=shieldRise;
                Polygon(shield,Ink(1,.2f,.015f,.08f),Ink(1,.65f,.05f,.08f));
                for(int i=0;i<shield.Length;i++){Line(shield[i],shield[(i+1)%shield.Length],9,Ink(1,.24f,.015f));Line(shield[i],shield[(i+1)%shield.Length],3,Ink(1,.9f,.3f));}
                for(int i=0;i<9;i++){float x=(i/8f-.5f)*w*.74f;Flame(new Vector2(x,h*.29f)*shieldRise,w*.1f,h*(.13f+.04f*Mathf.Sin(age*12+i)),i,.85f);}
                for(int i=0;i<9;i++){float a=age*2+i*Tau/9;var p=new Vector2(Mathf.Cos(a)*w*.45f,Mathf.Sin(a)*h*.47f);Disc(p,4,8,Ink(1,.8f,.15f),Ink(1,.2f,0,0));}
                return;
            }
            // A strike leaves flames climbing over the body, plus rising embers and smoke.
            int count=Barrier?16:14;float rise=Phase==ElementalVfxPhase.Origin?.6f:1;
            for(int i=0;i<count;i++)
            {
                float x=(i/(float)(count-1)-.5f)*w*.95f;
                float height=h*(Barrier?.23f:.38f)*(1+.35f*Mathf.Sin(age*10+i*2));
                Flame(new Vector2(x,-h*.48f),w*.15f,height*rise,i);
                if(i%2==0)
                {
                    float side=i%4==0?-1:1;Flame(new Vector2(side*w*.46f,-h*.35f+(i/(float)count)*h*.65f),w*.11f,h*(Barrier?.22f:.28f),i*2,.85f);
                }
            }
            if(!Barrier&&Phase==ElementalVfxPhase.Impact)
            {
                for(int i=0;i<4;i++){float t=Mathf.Repeat(age*.35f+i*.27f,1);Disc(new Vector2(Mathf.Sin(i*4)*w*.25f,-h*.1f+t*h*.6f),w*.3f,w*.25f,Ink(.18f,.13f,.1f,.18f*(1-t)),Ink(.1f,.1f,.1f,0));}
            }
            for(int i=0;i<15;i++){float t=Mathf.Repeat(age*.9f+i*.137f,1);var p=new Vector2(Mathf.Sin(i*13+age)*w*.49f,-h*.35f+t*h*.95f);Line(p,p+new Vector2(3,12),3,Ink(1,.8f,.1f,1-t));}
        }
        void Water()
        {
            if(Phase==ElementalVfxPhase.Travel)
            {
                // Three oscillating liquid ribbons with a foamy leading crest.
                for(int lane=0;lane<3;lane++)
                {
                    Vector2 last=Vector2.zero;
                    for(int i=0;i<=22;i++){float f=i/22f;var p=new Vector2((f-.5f)*w,Mathf.Sin(f*Tau*1.5f-age*19+lane)*h*.13f+(lane-1)*h*.16f);if(i>0){Line(last,p,h*.17f,Ink(.02f,.5f,1,.7f));Line(last,p,3,Ink(.7f,1,1,.95f));}last=p;}
                }
                Arc(new Vector2(w*.42f,0),h*.35f,h*.48f,-Mathf.PI*.5f,Mathf.PI,0,8,Ink(.8f,1,1));
                for(int i=0;i<7;i++)Drop(new Vector2(w*(.2f-i*.1f),Mathf.Sin(age*15+i)*h*.4f),5);return;
            }
            if(Barrier)
            {
                Disc(Vector2.zero,w*.54f,h*.54f,Ink(.05f,.5f,.9f,.1f),Ink(.05f,.5f,1,0));
                Arc(Vector2.zero,w*(.52f+.015f*Mathf.Sin(age*6)),h*.53f,0,Tau,0,14,Ink(.01f,.2f,.5f,.9f),52);
                Arc(Vector2.zero,w*(.52f+.015f*Mathf.Sin(age*6)),h*.53f,0,Tau,0,7,Ink(.4f,.9f,1,.95f),52);
                Arc(Vector2.zero,w*.5f,h*.51f,1.9f,1.3f,0,4,Ink(.9f,1,1,.9f));
                Arc(Vector2.zero,w*.56f,h*.56f,age*2,Mathf.PI*.8f,0,3,Ink(.8f,1,1),24);
                for(int i=0;i<9;i++){float t=Mathf.Repeat(age*.3f+i*.15f,1);var p=new Vector2(Mathf.Sin(i*8)*w*.4f,-h*.4f+t*h*.8f);Arc(p,5+i%3,5+i%3,0,Tau,0,2,Ink(.65f,1,1,.7f));}return;
            }
            bool fountain=Action==ElementalVfxAction.Heal||Action==ElementalVfxAction.Empower||Phase==ElementalVfxPhase.Origin;
            Disc(new Vector2(0,-h*.38f),w*.55f,h*.14f,Ink(.03f,.6f,1,.35f),Ink(.1f,.6f,1,0));
            for(int i=0;i<12;i++)
            {
                float t=Mathf.Repeat(age*(fountain?.65f:.85f)+i*.13f,1),spread=(i/11f-.5f);
                float y=fountain?-h*.4f+Mathf.Sin(t*Mathf.PI)*h*.85f:h*.25f-t*h*.8f;
                var p=new Vector2(spread*w*(.25f+t),y);
                Drop(p,7+4*Mathf.Sin(i),1-t*.65f);
                if(i%3==0)Line(p,p-new Vector2(spread*14,fountain?28:-20),3,Ink(.7f,1,1,.6f));
            }
            for(int i=0;i<3;i++){float t=Mathf.Repeat(age*.6f+i*.33f,1);Arc(new Vector2(0,-h*.39f),w*(.2f+t*.4f),h*(.04f+t*.08f),0,Tau,0,4,Ink(.4f,.9f,1,1-t));}
            if(!fountain)
            {
                float wash=Mathf.Clamp01(age/.5f);Line(new Vector2(-w*.48f,h*(.4f-wash*.7f)),new Vector2(w*.48f,h*(.4f-wash*.7f)),h*.13f,Ink(.1f,.65f,1,.35f));
            }
        }
        void Earth()
        {
            if(Phase==ElementalVfxPhase.Travel)
            {
                for(int i=0;i<4;i++)Rock(new Vector2(w*(.35f-i*.23f),Mathf.Sin(age*8+i)*h*.12f),h*(.35f-i*.055f),age*3+i);
                for(int i=0;i<9;i++){float t=Mathf.Repeat(age+i*.13f,1);Disc(new Vector2(-w*.3f-t*w*.2f,Mathf.Sin(i*7)*h*.28f),h*.13f,h*.1f,Ink(.45f,.3f,.14f,.4f*(1-t)),Ink(.4f,.3f,.2f,0));}return;
            }
            if(Barrier)
            {
                float rise=Mathf.Clamp01(age/.35f);
                // Solid stone buttresses and a low rampart, not an energy bubble.
                for(int side=-1;side<=1;side+=2)
                    for(int i=0;i<5;i++)Rock(new Vector2(side*w*.42f,-h*.36f+i*h*.18f-(1-rise)*h*.5f),w*.15f,i*.8f+side);
                for(int i=0;i<4;i++)Rock(new Vector2((i/3f-.5f)*w*.72f,-h*.39f-(1-rise)*h*.4f),w*.18f,i*.7f);
                return;
            }
            if(Action==ElementalVfxAction.Heal||Action==ElementalVfxAction.Empower)
            {
                for(int i=0;i<14;i++){float t=Mathf.Repeat(age*.3f+i*.17f,1);var p=new Vector2(Mathf.Sin(i*7+age)*w*.35f,-h*.4f+t*h*.9f);Leaf(p,12,age+i,Ink(.3f,.9f,.1f,1-t*.6f));}
                return;
            }
            float emerge=Mathf.Clamp01(age/.3f);
            for(int i=0;i<7;i++)
            {
                float x=(i/6f-.5f)*w*.95f,height=h*(.2f+.24f*Mathf.Abs(Mathf.Sin(i*5)))*emerge;
                var foot=new Vector2(x,-h*.46f);
                Polygon(new[]{foot+new Vector2(-w*.09f,0),foot+new Vector2(-w*.05f,height*.7f),foot+new Vector2(w*.01f,height),foot+new Vector2(w*.07f,height*.82f),foot+new Vector2(w*.1f,0)},Ink(.25f,.15f,.055f),Ink(.65f,.5f,.22f));
                Line(foot,foot+new Vector2(w*.01f,height*.8f),3,Ink(.45f,1,.08f,.9f));
            }
            for(int i=0;i<9;i++){float t=Mathf.Repeat(age*.65f+i*.1f,1);var p=new Vector2(Mathf.Sin(i*9)*w*(.15f+t*.45f),-h*.3f+Mathf.Sin(t*Mathf.PI)*h*.8f);Rock(p,7+(i%3)*4,age*4+i,1-t*.7f);}
            for(int i=0;i<5;i++)Disc(new Vector2((i/4f-.5f)*w,-h*.4f),w*.22f,h*.1f,Ink(.5f,.35f,.15f,.25f),Ink(.4f,.25f,.1f,0));
        }
        void Air()
        {
            if(Phase==ElementalVfxPhase.Travel)
            {
                for(int i=0;i<4;i++){float offset=(i-1.5f)*h*.2f;Arc(new Vector2(w*.12f,offset),w*.35f,h*.3f,age*9+i,Mathf.PI*1.4f,0,3+i%2,Ink(.75f,.98f,1,.9f));Line(new Vector2(-w*.48f,offset),new Vector2(w*.05f,offset+h*.08f),2,Ink(.4f,.85f,1,.65f));}
                for(int i=0;i<5;i++)Leaf(new Vector2(Mathf.Sin(age*5+i)*w*.3f,Mathf.Cos(age*5+i)*h*.35f),12,age*8+i,Ink(.85f,1,1));return;
            }
            if(Barrier)
            {
                // Fast crossing currents and orbiting feathers form a wind deflector.
                for(int i=0;i<3;i++)Arc(Vector2.zero,w*.59f,h*.55f,age*5+i*2,Mathf.PI*1.4f,(i-1)*.22f,4,Ink(.7f,.95f,1,.95f),40);
                for(int i=0;i<7;i++){float a=age*5+i*Tau/7;Leaf(new Vector2(Mathf.Cos(a)*w*.53f,Mathf.Sin(a)*h*.5f),15,a+Mathf.PI*.5f,Ink(.9f,1,1));}return;
            }
            if(Action==ElementalVfxAction.Heal||Action==ElementalVfxAction.Empower)
            {
                for(int i=0;i<12;i++){float t=Mathf.Repeat(age*.4f+i*.17f,1);Leaf(new Vector2(Mathf.Sin(t*6+i)*w*.4f,-h*.4f+t*h*.9f),14,t*9,Ink(.8f,1,1,1-t*.5f));}return;
            }
            for(int i=0;i<7;i++)
            {
                float f=i/6f;var p=new Vector2(Mathf.Sin(age*8+i*.5f)*w*.1f,-h*.4f+f*h*.85f);
                Arc(p,w*(.14f+f*.4f),h*.055f,age*(8-f*3)+i,Mathf.PI*1.65f,0,3+f*2,Ink(.7f,.95f,1,.95f));
            }
            for(int i=0;i<10;i++){float a=age*7+i*Tau/10;float y=-h*.4f+Mathf.Repeat(age*.4f+i*.13f,1)*h*.85f;Leaf(new Vector2(Mathf.Cos(a)*w*.5f,y),10,a,Ink(.85f,1,1,.85f));}
        }
    }
}
