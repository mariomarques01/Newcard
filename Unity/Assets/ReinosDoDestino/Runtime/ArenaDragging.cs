using System.Linq;
using ReinosDoDestino.Core;
using UnityEngine;

namespace ReinosDoDestino.Unity
{
    public sealed partial class ArenaController
    {
        string dragId, dragTarget;
        bool dragSpell, dragEnemies;
        RectTransform dragPreview;
        readonly System.Collections.Generic.Dictionary<string,RectTransform> dropFrames=new System.Collections.Generic.Dictionary<string,RectTransform>();
        public bool BeginCardDrag(string id,bool spell,Vector2 screen)
        {
            if(busy||dragId!=null||engine.State.turn!=Side.Player||engine.State.result!=MatchResult.Playing)return false;
            string name,artwork;Rect crop;Element element;
            if(spell)
            {
                var card=engine.State.hand.Find(c=>c.id==id);if(card==null)return false;
                var d=engine.Spell(card.templateId);
                if(engine.State.playerEnergy<d.cost){hint.text=$"Energia insuficiente: esta magia custa {d.cost}.";return false;}
                name=d.name;artwork=d.artwork;crop=new Rect(.12f,.47f,.76f,.42f);element=d.element;
                dragEnemies=d.ability.damage>0||d.ability.stun||d.ability.attackDown>0||d.ability.defenseDown>0;
            }
            else
            {
                var creature=engine.State.players.Find(c=>c.id==id);
                if(creature==null||!creature.Alive||creature.hasAttacked||creature.stunned){hint.text="Esta criatura não pode atacar agora.";return false;}
                var d=engine.Definition(id);name=d.name;artwork=d.artwork;crop=Crop(id,artwork);element=d.element;dragEnemies=true;
            }
            dragId=id;dragSpell=spell;
            dragPreview=Panel(effectsRoot,"DragPreview",Tone(element));
            dragPreview.anchorMin=dragPreview.anchorMax=new Vector2(.5f,.5f);dragPreview.sizeDelta=new Vector2(230,270);
            var group=dragPreview.gameObject.AddComponent<CanvasGroup>();group.blocksRaycasts=false;group.interactable=false;group.alpha=.94f;
            var image=Art(dragPreview,artwork,crop);Stretch(image.rectTransform,new Vector2(0,.2f),Vector2.one,5);
            var title=Label(dragPreview,name,28,Color.white);Stretch(title.rectTransform,Vector2.zero,new Vector2(1,.2f),3);
            MoveCardDrag(screen);return true;
        }
        public void MoveCardDrag(Vector2 screen)
        {
            if(dragId==null)return;
            dragPreview.position=new Vector3(Mathf.Clamp(screen.x,50*canvas.scaleFactor,Screen.width-50*canvas.scaleFactor),Mathf.Clamp(screen.y+115*canvas.scaleFactor,100*canvas.scaleFactor,Screen.height-100*canvas.scaleFactor));
            dragTarget=null;
            var court=dragEnemies?engine.State.rivals:engine.State.players;
            foreach(var creature in court)
                if(creature.Alive&&RectTransformUtility.RectangleContainsScreenPoint(views[creature.id].root,screen,null)){dragTarget=creature.id;break;}
            foreach(var creature in court)
            {
                if(!creature.Alive)continue;
                if(!dropFrames.TryGetValue(creature.id,out var frame))
                {
                    frame=Panel(views[creature.id].root,"DropTarget",Color.clear);Stretch(frame,Vector2.zero,Vector2.one,0);
                    var a=Panel(frame,"Top",Color.white);Stretch(a,new Vector2(0,.98f),Vector2.one,0);
                    var b=Panel(frame,"Bottom",Color.white);Stretch(b,Vector2.zero,new Vector2(1,.02f),0);
                    var c=Panel(frame,"Left",Color.white);Stretch(c,Vector2.zero,new Vector2(.02f,1),0);
                    var d=Panel(frame,"Right",Color.white);Stretch(d,new Vector2(.98f,0),Vector2.one,0);dropFrames.Add(creature.id,frame);
                }
                Color color=dragTarget==creature.id?Color.white:new Color(.2f,1,.75f,.8f);
                foreach(Transform edge in frame)edge.GetComponent<UnityEngine.UI.Image>().color=color;
            }
            hint.text=dragTarget==null?(dragEnemies?"Arraste e solte sobre um inimigo. Fora do alvo cancela.":"Arraste e solte sobre uma criatura aliada."):$"Solte para {(dragSpell?"lançar a magia em":"atacar")} {engine.Definition(dragTarget).name}.";
        }
        public void EndCardDrag(Vector2 screen)
        {
            if(dragId==null)return;MoveCardDrag(screen);
            string id=dragId,target=dragTarget;bool spell=dragSpell;CancelCardDrag();
            if(target==null){hint.text="Ação cancelada. Nenhuma carta ou energia foi consumida.";return;}
            if(spell)
            {
                if(dragEnemies)engine.SelectEnemy(target);else engine.SelectAlly(target);
                selectedCard=id;Act(()=>engine.Play(id));
            }
            else{engine.SelectAlly(id);engine.SelectEnemy(target);Act(engine.Attack);}
        }
        public void CancelCardDrag()
        {
            dragId=null;dragTarget=null;
            if(dragPreview!=null)Destroy(dragPreview.gameObject);dragPreview=null;
            foreach(var frame in dropFrames.Values)if(frame!=null)Destroy(frame.gameObject);dropFrames.Clear();
        }
    }
}
