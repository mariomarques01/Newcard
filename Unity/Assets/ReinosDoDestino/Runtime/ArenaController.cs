using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ReinosDoDestino.Core;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem.UI;
#endif

namespace ReinosDoDestino.Unity
{
    // First native vertical slice. The battle model never depends on scene objects.
    public sealed class ArenaController : MonoBehaviour
    {
        BattleEngine engine;
        public BattleEngine Battle { get { return engine; } }
        Canvas canvas;
        RectTransform safeArea, handRoot, effectsRoot;
        TMP_FontAsset font;
        TMP_Text score, hint, deckLabel;
        readonly Dictionary<string, CreatureView> views = new Dictionary<string, CreatureView>();
        readonly Dictionary<string, Texture2D> textures = new Dictionary<string, Texture2D>();
        readonly List<UnityEngine.UI.Button> actions = new List<UnityEngine.UI.Button>();
        string selectedCard;
        bool busy;
        Rect lastSafe;
        int lastWidth, lastHeight;
        static readonly Color Gold = new Color(.82f,.65f,.32f), Ink = new Color(.055f,.085f,.075f), Paper = new Color(.75f,.59f,.35f);
        string SavePath { get { return Path.Combine(Application.persistentDataPath,"elemental-unity-v1.json"); } }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (FindFirstObjectByType<ArenaController>() == null) new GameObject("ReinosDoDestino").AddComponent<ArenaController>();
        }
        void Awake()
        {
            var asset = Resources.Load<TextAsset>("Elemental/catalog");
            if (asset == null) { Debug.LogError("Catálogo Unity ausente. Execute node scripts/export-unity-catalog.mjs."); enabled=false; return; }
            engine = new BattleEngine(JsonUtility.FromJson<Catalog>(asset.text), Environment.TickCount);
            Load();
            font = TMP_Settings.defaultFontAsset;
            if (font == null) font = Resources.Load<TMP_FontAsset>("Fonts & Materials/LiberationSans SDF");
            if (font == null) font = TMP_FontAsset.CreateFontAsset(Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"));
            BuildUI(); Refresh();
            Application.targetFrameRate = Application.platform == RuntimePlatform.WebGLPlayer ? -1 : 60;
        }
        void Update()
        {
            if (safeArea == null || (Screen.safeArea == lastSafe && Screen.width == lastWidth && Screen.height == lastHeight)) return;
            lastSafe=Screen.safeArea; lastWidth=Screen.width; lastHeight=Screen.height;
            if(lastWidth<=0||lastHeight<=0)return;
            safeArea.anchorMin = new Vector2(lastSafe.xMin/lastWidth,lastSafe.yMin/lastHeight);
            safeArea.anchorMax = new Vector2(lastSafe.xMax/lastWidth,lastSafe.yMax/lastHeight);
            safeArea.offsetMin = safeArea.offsetMax = Vector2.zero;
        }
        void BuildUI()
        {
            var go = new GameObject("ArenaCanvas",typeof(RectTransform),typeof(Canvas),typeof(UnityEngine.UI.CanvasScaler),typeof(UnityEngine.UI.GraphicRaycaster));
            go.transform.SetParent(transform,false); canvas=go.GetComponent<Canvas>();canvas.renderMode=RenderMode.ScreenSpaceOverlay;
            var scaler=go.GetComponent<UnityEngine.UI.CanvasScaler>();scaler.uiScaleMode=UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;scaler.referenceResolution=new Vector2(1080,1920);scaler.matchWidthOrHeight=.5f;
            if(FindFirstObjectByType<EventSystem>()==null)
            {
                var events=new GameObject("ArenaEventSystem",typeof(EventSystem));
#if ENABLE_INPUT_SYSTEM
                events.AddComponent<InputSystemUIInputModule>().AssignDefaultActions();
#else
                events.AddComponent<StandaloneInputModule>();
#endif
            }
            var background=Panel(go.transform,"Background",Paper);Stretch(background,Vector2.zero,Vector2.one,0);
            safeArea=Panel(go.transform,"SafeArea",Color.clear);Stretch(safeArea,Vector2.zero,Vector2.one,12);
            var header=Panel(safeArea,"Header",Ink);Stretch(header,new Vector2(0,.945f),Vector2.one,4);
            var brand=Label(header,"REINOS DO DESTINO · ASCENSÃO ELEMENTAL",34,Gold);Stretch(brand.rectTransform,Vector2.zero,new Vector2(.9f,1),4);
            var restart=Button(header,"NOVO",()=>{if(busy)return;engine.NewMatch();selectedCard=null;Save();Refresh();},new Color(.25f,.2f,.12f));Stretch(restart.GetComponent<RectTransform>(),new Vector2(.91f,0),Vector2.one,3);
            var hud=Panel(safeArea,"Score",new Color(.08f,.16f,.2f));Stretch(hud,new Vector2(0,.865f),new Vector2(1,.945f),4);score=Label(hud,"",32,Color.white);
            BuildCourt(true,.575f,.865f);BuildCourt(false,.245f,.535f);
            var divider=Panel(safeArea,"Divider",Ink);Stretch(divider,new Vector2(0,.535f),new Vector2(1,.575f),4);deckLabel=Label(divider,"",27,Gold);
            handRoot=Panel(safeArea,"Hand",new Color(.38f,.28f,.13f));Stretch(handRoot,new Vector2(0,.12f),new Vector2(1,.245f),4);
            var note=Panel(safeArea,"Description",new Color(.9f,.77f,.51f));Stretch(note,new Vector2(0,.08f),new Vector2(1,.12f),4);hint=Label(note,"",25,Ink);
            var bar=Panel(safeArea,"Actions",Ink);Stretch(bar,Vector2.zero,new Vector2(1,.08f),4);
            string[] names={"JOGAR","ATACAR","DEFENDER","HABILIDADE\n2 ENERGIA","ENCERRAR\nTURNO"};
            Action[] commands={()=>Act(()=>engine.Play(selectedCard)),()=>Act(engine.Attack),()=>Act(engine.Defend),()=>Act(engine.UsePower),()=>Act(engine.EndTurn)};
            Color[] colors={new Color(.45f,.32f,.12f),new Color(.58f,.09f,.06f),new Color(.03f,.28f,.46f),new Color(.02f,.34f,.15f),new Color(.4f,.22f,.05f)};
            for(int i=0;i<5;i++){int index=i;var button=Button(bar,names[i],commands[index],colors[i]);Stretch(button.GetComponent<RectTransform>(),new Vector2(i/5f,0),new Vector2((i+1)/5f,1),4);actions.Add(button);}
            effectsRoot=Panel(go.transform,"ElementalEffects",Color.clear);Stretch(effectsRoot,Vector2.zero,Vector2.one,0);effectsRoot.SetAsLastSibling();
        }
        void BuildCourt(bool rival,float bottom,float top)
        {
            var court=Panel(safeArea,rival?"RivalCourt":"PlayerCourt",Color.clear);Stretch(court,new Vector2(0,bottom),new Vector2(1,top),2);
            var caption=Label(court,rival?"REINO ADVERSÁRIO":"SUA CORTE",32,Ink);Stretch(caption.rectTransform,new Vector2(0,.9f),Vector2.one,0);
            var definitions=rival?engine.Catalog.rivals:engine.Catalog.players;
            for(int i=0;i<definitions.Length;i++)
            {
                var d=definitions[i];var view=new CreatureView();
                var button=Button(court,"",()=>{if(busy)return;if(rival)engine.SelectEnemy(d.id);else engine.SelectAlly(d.id);Refresh();},Ink);
                view.root=button.GetComponent<RectTransform>();view.background=button.GetComponent<UnityEngine.UI.Image>();Stretch(view.root,new Vector2(i/3f,0),new Vector2((i+1)/3f,.9f),9);
                view.art=Art(view.root,d.artwork,Crop(d.id,d.artwork));Stretch(view.art.rectTransform,new Vector2(0,.25f),Vector2.one,4);
                var hpBadge=Panel(view.root,"Life",new Color(.38f,.035f,.025f,.95f));Stretch(hpBadge,new Vector2(0,.79f),new Vector2(.28f,1),2);view.hp=Label(hpBadge,"",42,Color.white);
                var elementBadge=Panel(view.root,"Element",Ink);Stretch(elementBadge,new Vector2(.58f,.85f),Vector2.one,2);Label(elementBadge,ElementName(d.element),23,Tone(d.element));
                var name=Label(view.root,d.name,28,Gold);Stretch(name.rectTransform,new Vector2(0,.12f),new Vector2(1,.25f),3);
                view.stats=Label(view.root,"",31,Color.white);Stretch(view.stats.rectTransform,Vector2.zero,new Vector2(1,.12f),2);
                var statusBadge=Panel(view.root,"Status",new Color(.035f,.06f,.05f,.8f));Stretch(statusBadge,new Vector2(0,.25f),new Vector2(1,.4f),2);view.status=Label(statusBadge,"",22,Color.white);
                views.Add(d.id,view);
            }
        }
        void Refresh()
        {
            var s=engine.State;
            score.text=$"VOCÊ {s.playerGlory}/12 PG · {s.playerEnergy}/5 ENERGIA\nRODADA {s.round} · {(s.result==MatchResult.Playing?"SUA VEZ":s.result==MatchResult.Victory?"VITÓRIA":"DERROTA")} · RIVAL {s.rivalGlory}/12 PG";
            deckLabel.text=$"BARALHO {s.deck.Count}       ARENA DOS REINOS       DESCARTE {s.discard.Count}";
            foreach(var c in s.players.Concat(s.rivals))
            {
                var v=views[c.id];v.hp.text=c.hp.ToString();v.stats.text=$"ATQ {c.attack}    DEF {c.defense}";
                var status=new List<string>();if(c.shield>0)status.Add($"+{c.shield} ESCUDO");if(c.stunned)status.Add("ATAQUE IMPEDIDO · 1T");if(c.attackReduction>0)status.Add($"−{c.attackReduction} ATQ · 1T");if(c.defenseReduction>0)status.Add($"−{c.defenseReduction} DEF · 1T");if(c.temporaryAttack>0)status.Add($"+{c.temporaryAttack} ATQ · 1T");
                v.status.transform.parent.gameObject.SetActive(status.Count>0);v.status.text=string.Join("\n",status);v.art.color=c.Alive?Color.white:new Color(.3f,.3f,.3f,.5f);
                bool selected=c.id==s.selectedAlly||c.id==s.selectedEnemy;v.background.color=selected?Color.Lerp(Ink,Tone(engine.Definition(c.id).element),.35f):Ink;
            }
            foreach(Transform child in handRoot){child.gameObject.SetActive(false);Destroy(child.gameObject);}
            for(int i=0;i<s.hand.Count;i++)
            {
                var card=s.hand[i];var d=engine.Spell(card.templateId);var instance=card.id;
                var button=Button(handRoot,"",()=>{if(busy)return;selectedCard=selectedCard==instance?null:instance;Refresh();},selectedCard==instance?Tone(d.element):Ink);
                var r=button.GetComponent<RectTransform>();Stretch(r,new Vector2(i/(float)s.hand.Count,0),new Vector2((i+1)/(float)s.hand.Count,1),7);
                var art=Art(r,d.artwork,new Rect(.12f,.47f,.76f,.42f));Stretch(art.rectTransform,new Vector2(0,.22f),Vector2.one,4);if(s.playerEnergy<d.cost)art.color=new Color(.45f,.45f,.45f);
                var name=Label(r,d.name,23,Color.white);Stretch(name.rectTransform,Vector2.zero,new Vector2(1,.25f),3);
                var cost=Label(r,d.cost.ToString(),33,Color.white);Stretch(cost.rectTransform,new Vector2(0,.69f),new Vector2(.23f,1),1);
            }
            if(!s.hand.Any(c=>c.id==selectedCard))selectedCard=null;
            var active=s.players.Find(c=>c.id==s.selectedAlly);
            hint.text=selectedCard!=null?engine.Spell(s.hand.Find(c=>c.id==selectedCard).templateId).description:active!=null?engine.Definition(active.id).description:"Partida encerrada";
            UpdateButtons();
        }
        void UpdateButtons()
        {
            var s=engine.State;bool ready=!busy&&s.result==MatchResult.Playing&&s.turn==Side.Player;
            var ally=s.players.Find(c=>c.id==s.selectedAlly);var enemy=s.rivals.Find(c=>c.id==s.selectedEnemy);var card=s.hand.Find(c=>c.id==selectedCard);
            actions[0].interactable=ready&&card!=null&&s.playerEnergy>=engine.Spell(card.templateId).cost;
            actions[1].interactable=ready&&ally!=null&&ally.Alive&&!ally.hasAttacked&&!ally.stunned&&enemy!=null&&enemy.Alive;
            actions[2].interactable=ready&&ally!=null&&ally.Alive&&!ally.defending;
            actions[3].interactable=ready&&ally!=null&&ally.Alive&&s.playerEnergy>=2;
            actions[4].interactable=ready;
        }
        void Act(Func<ActionResult> command)
        {
            if(busy)return;var result=command();if(!result.success){hint.text=result.message;return;}
            selectedCard=null;StartCoroutine(Animate(result));
        }
        IEnumerator Animate(ActionResult result)
        {
            busy=true;UpdateButtons();hint.text=result.message;
            foreach(var e in result.events)StartCoroutine(AnimateEvent(e));
            yield return new WaitForSeconds(.72f);
            Refresh();busy=false;UpdateButtons();Save();
        }
        IEnumerator AnimateEvent(CombatEvent e)
        {
            if(!views.ContainsKey(e.targetId)||!views.ContainsKey(e.sourceId))yield break;
            Vector3 from=views[e.sourceId].root.position,to=views[e.targetId].root.position;
            var effect=Panel(effectsRoot,"Spell_"+e.element,Tone(e.element));effect.sizeDelta=new Vector2(30,30);
            for(float t=0;t<.38f;t+=Time.unscaledDeltaTime){effect.position=Vector3.Lerp(from,to,t/.38f)+Vector3.up*Mathf.Sin(t/.38f*Mathf.PI)*35;effect.localRotation=Quaternion.Euler(0,0,t*600);yield return null;}
            Destroy(effect.gameObject);
            string message=e.hpLost>0?$"−{e.hpLost} VIDA":e.healed>0?$"+{e.healed} VIDA":e.shieldGained>0?$"+{e.shieldGained} ESCUDO":e.stunned?"ATAQUE IMPEDIDO":e.attackChange!=0?$"{e.attackChange:+#;-#} ATQ":e.defenseChange!=0?$"{e.defenseChange:+#;-#} DEF":e.title;
            var text=Label(effectsRoot,message,32,Tone(e.element));text.rectTransform.sizeDelta=new Vector2(330,70);text.rectTransform.position=to;
            for(float t=0;t<.3f;t+=Time.unscaledDeltaTime){text.rectTransform.position=to+Vector3.up*t*80;yield return null;}
            Destroy(text.gameObject);
        }
        void Save(){if(busy||engine.State.turn!=Side.Player)return;try{File.WriteAllText(SavePath,JsonUtility.ToJson(engine.State));}catch(Exception e){Debug.LogWarning("Save indisponível: "+e.Message);}}
        void Load(){try{if(File.Exists(SavePath))engine.Restore(JsonUtility.FromJson<BattleState>(File.ReadAllText(SavePath)));}catch(Exception e){Debug.LogWarning("Save ignorado: "+e.Message);}}
        void OnApplicationPause(bool paused){if(paused)Save();}
        void OnApplicationQuit(){Save();}
        UnityEngine.UI.RawImage Art(Transform parent,string artwork,Rect uv)
        {
            if(!textures.TryGetValue(artwork,out var texture)){texture=Resources.Load<Texture2D>("Elemental/Artwork/"+artwork);textures[artwork]=texture;}
            var go=new GameObject("Artwork",typeof(RectTransform),typeof(UnityEngine.UI.RawImage));go.transform.SetParent(parent,false);var image=go.GetComponent<UnityEngine.UI.RawImage>();image.texture=texture;image.uvRect=uv;image.raycastTarget=false;return image;
        }
        static Rect Crop(string id,string artwork)
        {
            if(artwork=="creatures")return new Rect(id=="p_rainha_copas"?1f/3:2f/3,0,1f/3,.5f);
            return new Rect(id=="r_rei_ouros"?.3f:.22f,.47f,.54f,.41f);
        }
        RectTransform Panel(Transform parent,string name,Color color)
        {
            var go=new GameObject(name,typeof(RectTransform),typeof(UnityEngine.UI.Image));go.transform.SetParent(parent,false);var image=go.GetComponent<UnityEngine.UI.Image>();image.color=color;image.raycastTarget=false;return go.GetComponent<RectTransform>();
        }
        TMP_Text Label(Transform parent,string text,float size,Color color)
        {
            var go=new GameObject("Label",typeof(RectTransform),typeof(TextMeshProUGUI));go.transform.SetParent(parent,false);var label=go.GetComponent<TextMeshProUGUI>();label.font=font;label.text=text;label.fontSize=size;label.enableAutoSizing=true;label.fontSizeMin=Mathf.Min(14,size);label.fontSizeMax=size;label.color=color;label.alignment=TextAlignmentOptions.Center;label.raycastTarget=false;label.overflowMode=TextOverflowModes.Truncate;Stretch(label.rectTransform,Vector2.zero,Vector2.one,5);return label;
        }
        UnityEngine.UI.Button Button(Transform parent,string title,Action action,Color color)
        {
            var rect=Panel(parent,"Button_"+title,color);var image=rect.GetComponent<UnityEngine.UI.Image>();image.raycastTarget=true;var button=rect.gameObject.AddComponent<UnityEngine.UI.Button>();button.targetGraphic=image;var colors=button.colors;colors.disabledColor=new Color(.28f,.28f,.28f,.8f);button.colors=colors;button.onClick.AddListener(()=>action());if(title.Length>0)Label(rect,title,29,Color.white);return button;
        }
        static void Stretch(RectTransform rect,Vector2 min,Vector2 max,float inset){rect.anchorMin=min;rect.anchorMax=max;rect.offsetMin=new Vector2(inset,inset);rect.offsetMax=new Vector2(-inset,-inset);}
        static Color Tone(Element e){return e==Element.Fire?new Color(1,.35f,.08f):e==Element.Water?new Color(.1f,.7f,1):e==Element.Earth?new Color(.4f,.75f,.2f):new Color(.65f,.85f,1);}
        static string ElementName(Element e){return e==Element.Fire?"FOGO":e==Element.Water?"ÁGUA":e==Element.Earth?"TERRA":"AR";}
        sealed class CreatureView{public RectTransform root;public UnityEngine.UI.Image background;public UnityEngine.UI.RawImage art;public TMP_Text hp,stats,status;}
    }
}
