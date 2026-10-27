using UnityEngine;
using UnityEngine.EventSystems;

namespace ReinosDoDestino.Unity
{
    // The original card stays in its layout; only a non-raycasting preview follows the finger.
    public sealed class ArenaCardGesture : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IInitializePotentialDragHandler
    {
        ArenaController arena;
        string id;
        bool spell, dragging;
        public void Bind(ArenaController controller,string cardId,bool isSpell){arena=controller;id=cardId;spell=isSpell;}
        public void OnInitializePotentialDrag(PointerEventData data){data.useDragThreshold=true;}
        public void OnBeginDrag(PointerEventData data){dragging=arena.BeginCardDrag(id,spell,data.position);if(dragging)data.eligibleForClick=false;}
        public void OnDrag(PointerEventData data){if(dragging)arena.MoveCardDrag(data.position);}
        public void OnEndDrag(PointerEventData data){if(!dragging)return;dragging=false;data.eligibleForClick=false;arena.EndCardDrag(data.position);}
        void OnDisable(){if(dragging&&arena!=null){dragging=false;arena.CancelCardDrag();}}
    }
}
