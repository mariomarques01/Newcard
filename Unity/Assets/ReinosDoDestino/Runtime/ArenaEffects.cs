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
        readonly Dictionary<string,ElementalVfxGraphic> wards=new Dictionary<string,ElementalVfxGraphic>();
        readonly Dictionary<string,ElementalVfxGraphic> reactions=new Dictionary<string,ElementalVfxGraphic>();
        public bool IsAnimating { get { return busy; } }
        // Limit visual time jumps: a browser/GPU stall must not skip the origin or the projectile.
        internal static float PresentationDelta { get { return Mathf.Min(Time.unscaledDeltaTime,.08f); } }
        static IEnumerator VisualWait(float seconds)
        {
            for(float elapsed=0;elapsed<seconds;elapsed+=PresentationDelta)yield return null;
        }
        IEnumerator Animate(ActionResult result)
        {
            busy=true;UpdateButtons();string title=ActionCaption(result);hint.text=title;
            StartCoroutine(Announce(title));
            // Keep separate actions/elements separate: an enemy strike must not turn an allied heal into the same effect.
            var groups=result.events.GroupBy(e=>new {e.sourceId,e.targetId,e.title,e.element}).ToArray();
            var origins=new HashSet<string>();
            foreach(var group in groups)
            {
                var first=group.First();string key=first.sourceId+"/"+first.element+"/"+first.title;
                StartCoroutine(PresentElementalAction(group.ToArray(),origins.Add(key)));
            }
            foreach(var target in result.events.GroupBy(e=>e.targetId))StartCoroutine(ShowOutcomeAfterImpact(target.ToArray()));
            if(groups.Length==0&&engine.State.selectedAlly!=null)
                StartCoroutine(PresentElementalAction(new[]{new CombatEvent{sourceId=engine.State.selectedAlly,targetId=engine.State.selectedAlly,title=result.message,element=engine.Definition(engine.State.selectedAlly).element}},true));
            yield return VisualWait(.72f);
            Refresh();hint.text=title;
            yield return VisualWait(1.53f);
            busy=false;UpdateButtons();Save();
        }
        static string ActionCaption(ActionResult result)
        {
            if(result.events.Count==0)return result.message;
            var element=result.events[0].element;
            if(result.message=="Ataque elemental")return "Ataque de "+ElementName(element).ToLowerInvariant();
            if(result.message!="Defesa elemental")return result.message;
            return element==Element.Fire?"Barreira de brasas":element==Element.Water?"Bolha protetora":element==Element.Earth?"Muralha de pedra":"Ciclone defensivo";
        }
        IEnumerator Announce(string title)
        {
            var banner=Panel(effectsRoot,"CastBanner",new Color(.025f,.045f,.04f,.94f));
            Stretch(banner,new Vector2(.04f,.535f),new Vector2(.96f,.595f),0);
            Label(banner,title.ToUpperInvariant(),38,Gold);
            var group=banner.gameObject.AddComponent<CanvasGroup>();
            for(float t=0;t<2.1f;t+=PresentationDelta){group.alpha=Mathf.Clamp01(t/.12f)*Mathf.Clamp01((2.1f-t)/.3f);yield return null;}
            Destroy(banner.gameObject);
        }
        RectTransform EffectRoot(string name,Vector3 position)
        {
            var r=Panel(effectsRoot,name,Color.clear);r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=Vector2.zero;r.position=position;return r;
        }
        static Vector3 ArtCenter(CreatureView view){return view.art.rectTransform.TransformPoint(view.art.rectTransform.rect.center);}
        ElementalVfxGraphic Visual(Transform parent,Element element,ElementalVfxPhase phase,ElementalVfxAction action,Vector2 size,float duration)
        {
            var go=new GameObject(element+"_"+action+"_"+phase,typeof(RectTransform),typeof(ElementalVfxGraphic));go.transform.SetParent(parent,false);
            var graphic=go.GetComponent<ElementalVfxGraphic>();graphic.rectTransform.anchorMin=graphic.rectTransform.anchorMax=new Vector2(.5f,.5f);graphic.rectTransform.sizeDelta=size;
            graphic.Initialize(element,phase,action,duration);return graphic;
        }
        static ElementalVfxAction Presentation(CombatEvent[] events)
        {
            if(events.Any(e=>e.hpLost+e.shieldLost>0||e.stunned||e.attackChange<0||e.defenseChange<0))return ElementalVfxAction.Strike;
            if(events.Any(e=>e.healed>0))return ElementalVfxAction.Heal;
            if(events.Any(e=>e.shieldGained>0)&&!events[0].title.Contains("Evolução"))return ElementalVfxAction.Guard;
            return ElementalVfxAction.Empower;
        }
        IEnumerator PresentElementalAction(CombatEvent[] events,bool showOrigin)
        {
            var first=events[0];if(!views.TryGetValue(first.targetId,out var target)||!views.TryGetValue(first.sourceId,out var source))yield break;
            var action=Presentation(events);Vector3 from=ArtCenter(source),to=ArtCenter(target);
            if(showOrigin)
            {
                var origin=Visual(effectsRoot,first.element,ElementalVfxPhase.Origin,action,source.art.rectTransform.rect.size,.95f);origin.rectTransform.position=from;
            }
            yield return VisualWait(.28f);
            if(first.sourceId!=first.targetId)
            {
                var bolt=Visual(effectsRoot,first.element,ElementalVfxPhase.Travel,action,new Vector2(320,110),0);
                Vector3 direction=to-from;Vector3 perpendicular=new Vector3(-direction.y,direction.x).normalized;
                for(float t=0;t<.42f;t+=PresentationDelta)
                {
                    float u=Mathf.Clamp01(t/.42f);
                    float arc=first.element==Element.Earth?105:first.element==Element.Air?Mathf.Sin(u*Mathf.PI*3)*25:12;
                    bolt.rectTransform.position=Vector3.Lerp(from,to,u)+perpendicular*(Mathf.Sin(u*Mathf.PI)*arc*canvas.scaleFactor);
                    bolt.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Atan2(direction.y,direction.x)*Mathf.Rad2Deg);
                    yield return null;
                }
                Destroy(bolt.gameObject);
            }
            else yield return VisualWait(.42f);
            float duration=action==ElementalVfxAction.Strike?(first.element==Element.Fire?2.7f:2.3f):1.4f;
            string key=first.targetId+"/"+action;
            if(reactions.TryGetValue(key,out var previous)&&previous!=null)Destroy(previous.gameObject);
            var reaction=Visual(effectsRoot,first.element,ElementalVfxPhase.Impact,action,target.art.rectTransform.rect.size,duration);
            reaction.rectTransform.position=to;reactions[key]=reaction;
            if(action==ElementalVfxAction.Strike)StartCoroutine(ElementalHitMotion(target,first.element));
        }
        IEnumerator ElementalHitMotion(CreatureView target,Element element)
        {
            var card=target.root;var initial=card.anchoredPosition;var rotation=card.localRotation;
            for(float t=0;t<.35f;t+=PresentationDelta)
            {
                float fade=1-t/.35f;
                if(element==Element.Water)card.anchoredPosition=initial+Vector2.up*Mathf.Sin(t/.35f*Mathf.PI)*18;
                else if(element==Element.Air){card.anchoredPosition=initial+Vector2.right*Mathf.Sin(t*18)*22*fade;card.localRotation=Quaternion.Euler(0,0,Mathf.Sin(t*18)*4*fade);}
                else card.anchoredPosition=initial+new Vector2(Mathf.Sin(t*90)*(element==Element.Earth?16:6)*fade,-Mathf.Abs(Mathf.Sin(t*30))*8*fade);
                yield return null;
            }
            card.anchoredPosition=initial;card.localRotation=rotation;
        }
        IEnumerator ShowOutcomeAfterImpact(CombatEvent[] events)
        {
            yield return VisualWait(.7f);
            if(views.TryGetValue(events[0].targetId,out var target))yield return FloatingOutcome(events,ArtCenter(target));
        }
        IEnumerator FloatingOutcome(CombatEvent[] events,Vector3 position)
        {
            string message=Outcome(events);float height=Mathf.Max(76,message.Split('\n').Length*44+16);
            var root=EffectRoot("CombatNumbers",position);var panel=Panel(root,"ReadableOutcome",new Color(.015f,.025f,.02f,.78f));
            panel.anchorMin=panel.anchorMax=new Vector2(.5f,.5f);panel.sizeDelta=new Vector2(370,height);
            var text=Label(panel,message,38,events.Any(e=>e.healed>0)?new Color(.65f,1,.65f):Color.white);text.fontStyle=TMPro.FontStyles.Bold;
            var group=root.gameObject.AddComponent<CanvasGroup>();
            for(float t=0;t<1.35f;t+=PresentationDelta)
            {
                group.alpha=Mathf.Clamp01((1.35f-t)/.35f);panel.anchoredPosition=new Vector2(0,40+t*65);
                Vector3 point=panel.position;float halfWidth=panel.rect.width*canvas.scaleFactor*.5f,halfHeight=height*canvas.scaleFactor*.5f;
                point.x=Mathf.Clamp(point.x,halfWidth+8,Screen.width-halfWidth-8);point.y=Mathf.Clamp(point.y,halfHeight+8,Screen.height-halfHeight-8);panel.position=point;
                yield return null;
            }
            Destroy(root.gameObject);
        }
        void ClearElementalPresentation()
        {
            StopAllCoroutines();
            if(effectsRoot!=null)foreach(Transform effect in effectsRoot)Destroy(effect.gameObject);
            reactions.Clear();
        }
        void RefreshElementalWards()
        {
            foreach(var creature in engine.State.players.Concat(engine.State.rivals))
            {
                bool active=creature.Alive&&creature.defending&&creature.shield>0;
                wards.TryGetValue(creature.id,out var current);
                if(!active){if(current!=null)Destroy(current.gameObject);wards.Remove(creature.id);continue;}
                if(current!=null)continue;
                var parent=views[creature.id].art.rectTransform;
                var ward=Visual(parent,engine.Definition(creature.id).element,ElementalVfxPhase.Ward,ElementalVfxAction.Guard,parent.rect.size,0);
                Stretch(ward.rectTransform,Vector2.zero,Vector2.one,0);wards[creature.id]=ward;
            }
        }
        static string Outcome(CombatEvent[] events)
        {
            var parts=new List<string>();int hp=events.Sum(e=>e.hpLost),lost=events.Sum(e=>e.shieldLost),heal=events.Sum(e=>e.healed),shield=events.Sum(e=>e.shieldGained),attack=events.Sum(e=>e.attackChange),defense=events.Sum(e=>e.defenseChange);
            if(hp>0)parts.Add($"−{hp} VIDA");if(lost>0)parts.Add($"−{lost} ESCUDO");if(heal>0)parts.Add($"+{heal} VIDA");if(shield>0)parts.Add($"+{shield} ESCUDO");if(attack!=0)parts.Add($"{attack:+#;-#} ATQ");if(defense!=0)parts.Add($"{defense:+#;-#} DEF");if(events.Any(e=>e.stunned))parts.Add("ATAQUE IMPEDIDO");if(events.Any(e=>e.defeated))parts.Add("DERROTADO");
            return parts.Count==0?events[0].title:string.Join("\n",parts);
        }
    }
}
