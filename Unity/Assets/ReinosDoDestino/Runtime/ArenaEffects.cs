using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using ReinosDoDestino.Core;
using UnityEngine;

namespace ReinosDoDestino.Unity
{
    public sealed partial class ArenaController
    {
        Texture2D novaAtlas;
        Sprite glowSprite;
        Texture2D glowTexture;
        public bool IsAnimating { get { return busy; } }
        IEnumerator Animate(ActionResult result)
        {
            busy=true;UpdateButtons();hint.text=result.message;
            StartCoroutine(Announce(result.message));
            var groups=result.events.GroupBy(e=>e.targetId).ToArray();
            foreach(var group in groups)StartCoroutine(Impact(group.ToArray()));
            if(groups.Length==0&&engine.State.selectedAlly!=null)
                StartCoroutine(Impact(new[]{new CombatEvent{sourceId=engine.State.selectedAlly,targetId=engine.State.selectedAlly,title=result.message,element=engine.Definition(engine.State.selectedAlly).element}}));
            yield return new WaitForSecondsRealtime(.7f);
            Refresh();hint.text=result.message;
            yield return new WaitForSecondsRealtime(1.05f);
            busy=false;UpdateButtons();Save();
        }
        IEnumerator Announce(string title)
        {
            var banner=Panel(effectsRoot,"CastBanner",new Color(.025f,.045f,.04f,.94f));
            Stretch(banner,new Vector2(.04f,.535f),new Vector2(.96f,.595f),0);
            var text=Label(banner,title.ToUpperInvariant(),38,Gold);
            var group=banner.gameObject.AddComponent<CanvasGroup>();
            for(float t=0;t<1.65f;t+=Time.unscaledDeltaTime){group.alpha=Mathf.Clamp01(t/.12f)*Mathf.Clamp01((1.65f-t)/.3f);yield return null;}
            Destroy(banner.gameObject);
        }
        RectTransform EffectRoot(string name,Vector3 position)
        {
            var r=Panel(effectsRoot,name,Color.clear);r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=Vector2.zero;r.position=position;return r;
        }
        static Vector3 ArtCenter(CreatureView view){return view.art.rectTransform.TransformPoint(view.art.rectTransform.rect.center);}
        UnityEngine.UI.Image Glow(Transform parent,float size,Color color)
        {
            if(glowSprite==null)
            {
                glowTexture=new Texture2D(64,64,TextureFormat.RGBA32,false);glowTexture.wrapMode=TextureWrapMode.Clamp;
                for(int y=0;y<64;y++)for(int x=0;x<64;x++){float d=Vector2.Distance(new Vector2(x,y),new Vector2(31.5f,31.5f))/32;glowTexture.SetPixel(x,y,new Color(1,1,1,Mathf.Pow(Mathf.Clamp01(1-d),2)));}
                glowTexture.Apply(false,true);glowSprite=Sprite.Create(glowTexture,new Rect(0,0,64,64),new Vector2(.5f,.5f));
            }
            var go=new GameObject("Glow",typeof(RectTransform),typeof(UnityEngine.UI.Image));go.transform.SetParent(parent,false);
            var image=go.GetComponent<UnityEngine.UI.Image>();image.sprite=glowSprite;image.color=color;image.raycastTarget=false;image.rectTransform.sizeDelta=Vector2.one*size;return image;
        }
        UnityEngine.UI.RawImage Nova(Transform parent,Element element,bool shield)
        {
            if(novaAtlas==null)novaAtlas=Resources.Load<Texture2D>("Elemental/VFX/Novas");
            var go=new GameObject("ElementalNova",typeof(RectTransform),typeof(UnityEngine.UI.RawImage));go.transform.SetParent(parent,false);
            var image=go.GetComponent<UnityEngine.UI.RawImage>();image.texture=novaAtlas;image.raycastTarget=false;
            image.uvRect=shield?new Rect(.5f,.5f,.5f,.5f):element==Element.Fire?new Rect(0,.5f,.5f,.5f):element==Element.Water?new Rect(.5f,.5f,.5f,.5f):element==Element.Earth?new Rect(.5f,0,.5f,.5f):new Rect(0,0,.5f,.5f);
            image.rectTransform.sizeDelta=Vector2.one*340;
            image.color=element==Element.Earth&&!shield?new Color(.55f,1,.35f):Color.white;return image;
        }
        ArenaRingGraphic Ring(Transform parent,Color color,int segments=64)
        {
            var go=new GameObject("EnergyRing",typeof(RectTransform),typeof(ArenaRingGraphic));go.transform.SetParent(parent,false);
            var ring=go.GetComponent<ArenaRingGraphic>();ring.color=color;ring.raycastTarget=false;ring.segments=segments;ring.rectTransform.sizeDelta=new Vector2(200,200);return ring;
        }
        IEnumerator Impact(CombatEvent[] events)
        {
            var first=events[0];if(!views.TryGetValue(first.targetId,out var target)||!views.TryGetValue(first.sourceId,out var source))yield break;
            Color tone=Tone(first.element);
            bool damage=events.Any(e=>e.hpLost+e.shieldLost>0),shield=events.Any(e=>e.shieldGained>0),heal=events.Any(e=>e.healed>0);
            bool stun=events.Any(e=>e.stunned);
            Vector3 from=ArtCenter(source),to=ArtCenter(target);
            var charge=EffectRoot("CastCharge",from);var chargeGlow=Glow(charge,360,tone);var chargeRing=Ring(charge,tone);
            for(float t=0;t<.22f;t+=Time.unscaledDeltaTime){charge.localScale=Vector3.one*(.4f+t*3);chargeRing.rectTransform.localRotation=Quaternion.Euler(0,0,t*240);yield return null;}
            Destroy(charge.gameObject);
            if(first.sourceId!=first.targetId)
            {
                var bolt=EffectRoot("ElementalProjectile",from);Glow(bolt,220,tone);var core=Nova(bolt,first.element,false);core.rectTransform.sizeDelta=Vector2.one*150;
                var trail=new List<UnityEngine.UI.Image>();for(int i=0;i<9;i++)trail.Add(Glow(effectsRoot,110-i*7,tone));
                for(float t=0;t<.4f;t+=Time.unscaledDeltaTime)
                {
                    float u=Mathf.Clamp01(t/.4f);bolt.position=Vector3.Lerp(from,to,u)+Vector3.right*Mathf.Sin(u*Mathf.PI)*30*canvas.scaleFactor;
                    bolt.localRotation=Quaternion.Euler(0,0,t*300);
                    for(int i=0;i<trail.Count;i++){float v=Mathf.Clamp01(u-i*.035f);trail[i].rectTransform.position=Vector3.Lerp(from,to,v);trail[i].color=new Color(tone.r,tone.g,tone.b,(1-i/10f)*.7f);}
                    yield return null;
                }
                Destroy(bolt.gameObject);foreach(var image in trail)Destroy(image.gameObject);
            }
            else yield return new WaitForSecondsRealtime(.4f);
            var root=EffectRoot("ElementalImpact_"+first.element,to);Glow(root,500,tone);
            var nova=Nova(root,first.element,shield&&!damage);
            var ring=Ring(root,shield?new Color(.2f,.85f,1):tone,shield?6:64);
            var second=Ring(root,Color.white,first.element==Element.Earth?6:64);second.rectTransform.localRotation=Quaternion.Euler(0,0,30);
            var pieces=new List<UnityEngine.UI.Image>();
            for(int i=0;i<16;i++)
            {
                UnityEngine.UI.Image piece;
                if(first.element==Element.Earth&&!heal&&!shield)
                {
                    var rock=Panel(root,"StoneShard",new Color(.36f,.24f,.1f));rock.sizeDelta=new Vector2(32,48);piece=rock.GetComponent<UnityEngine.UI.Image>();
                    var edge=rock.gameObject.AddComponent<UnityEngine.UI.Outline>();edge.effectColor=tone;edge.effectDistance=new Vector2(2,-2);rock.localRotation=Quaternion.Euler(0,0,i*47);
                }
                else{piece=Glow(root,45,tone);if(first.element==Element.Fire)piece.rectTransform.sizeDelta=new Vector2(28,90);}
                pieces.Add(piece);
            }
            var spiral=new List<ArenaRingGraphic>();
            if(first.element==Element.Air)
                for(int i=0;i<6;i++){var air=Ring(root,new Color(.65f,.9f,1,.85f));air.rectTransform.sizeDelta=new Vector2(80+i*35,32+i*9);spiral.Add(air);}
            var numbers=Label(root,Outcome(events),40,Color.white);numbers.rectTransform.anchorMin=numbers.rectTransform.anchorMax=new Vector2(.5f,.5f);numbers.rectTransform.sizeDelta=new Vector2(370,110);numbers.fontStyle=TMPro.FontStyles.Bold;numbers.outlineWidth=.2f;numbers.outlineColor=Ink;
            var group=root.gameObject.AddComponent<CanvasGroup>();
            var card=target.root;var basePosition=card.anchoredPosition;
            for(float t=0;t<1.12f;t+=Time.unscaledDeltaTime)
            {
                float u=t/1.12f;group.alpha=Mathf.Clamp01((1.12f-t)/.4f);
                nova.rectTransform.localScale=Vector3.one*(.4f+Mathf.Min(1,u*3)*.9f);
                nova.rectTransform.localRotation=Quaternion.Euler(0,0,t*(first.element==Element.Air?280:40));
                ring.rectTransform.localScale=Vector3.one*(.7f+u*1.3f);second.rectTransform.localScale=Vector3.one*(.45f+u*2.2f);
                ring.rectTransform.localRotation=Quaternion.Euler(0,0,t*(stun?360:75));
                for(int i=0;i<pieces.Count;i++)
                {
                    float angle=i*Mathf.PI*2/16+t*(first.element==Element.Air?5:1);float radius=(40+u*200)*(first.element==Element.Water?.8f:1);
                    pieces[i].rectTransform.anchoredPosition=new Vector2(Mathf.Cos(angle)*radius,Mathf.Sin(angle)*radius+(heal?u*160:0));
                    pieces[i].rectTransform.localScale=Vector3.one*(1-u*.7f);
                }
                for(int i=0;i<spiral.Count;i++)spiral[i].rectTransform.anchoredPosition=new Vector2(Mathf.Sin(u*15+i)*30,-100+i*40+u*35);
                numbers.rectTransform.anchoredPosition=new Vector2(0,55+u*120);
                if(damage){card.anchoredPosition=basePosition+Vector2.right*Mathf.Sin(t*85)*14*Mathf.Clamp01(1-t/.35f);target.art.color=Color.Lerp(Color.white,tone,Mathf.Clamp01(1-t/.25f)*.8f);}
                yield return null;
            }
            card.anchoredPosition=basePosition;
            var state=engine.State.players.Concat(engine.State.rivals).FirstOrDefault(c=>c.id==first.targetId);
            target.art.color=state!=null&&state.Alive?Color.white:new Color(.3f,.3f,.3f,.5f);
            Destroy(root.gameObject);
        }
        static string Outcome(CombatEvent[] events)
        {
            var parts=new List<string>();int hp=events.Sum(e=>e.hpLost),lost=events.Sum(e=>e.shieldLost),heal=events.Sum(e=>e.healed),shield=events.Sum(e=>e.shieldGained),attack=events.Sum(e=>e.attackChange),defense=events.Sum(e=>e.defenseChange);
            if(hp>0)parts.Add($"−{hp} VIDA");if(lost>0)parts.Add($"−{lost} ESCUDO");if(heal>0)parts.Add($"+{heal} VIDA");if(shield>0)parts.Add($"+{shield} ESCUDO");if(attack!=0)parts.Add($"{attack:+#;-#} ATQ");if(defense!=0)parts.Add($"{defense:+#;-#} DEF");if(events.Any(e=>e.stunned))parts.Add("ATAQUE IMPEDIDO");if(events.Any(e=>e.defeated))parts.Add("DERROTADO");
            return parts.Count==0?events[0].title:string.Join("\n",parts);
        }
        void OnDestroy(){if(glowSprite!=null)Destroy(glowSprite);if(glowTexture!=null)Destroy(glowTexture);}
    }
}
