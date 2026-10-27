using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using ReinosDoDestino.Unity;

namespace ReinosDoDestino.Tests
{
    public sealed class ArenaInteractionTests
    {
        static Vector2 Center(Transform transform){var rect=transform.GetComponent<RectTransform>();return rect.TransformPoint(rect.rect.center);}
        [UnityTest] public IEnumerator DroppingSpellOutsideCancelsAndDroppingOnEnemyCastsWithVisibleEffects()
        {
            var arena=Object.FindFirstObjectByType<ArenaController>();if(arena==null)arena=new GameObject("TestArena").AddComponent<ArenaController>();
            while(arena.IsAnimating)yield return null;
            arena.StartNewMatch();yield return null;Canvas.ForceUpdateCanvases();
            var canvas=arena.GetComponentInChildren<Canvas>();var hand=canvas.transform.Find("SafeArea/Hand");
            var rival=canvas.transform.Find("SafeArea/RivalCourt").GetComponentsInChildren<UnityEngine.UI.Button>()[0];
            string id=arena.Battle.State.hand[0].id;int hp=arena.Battle.State.rivals[0].hp;
            Assert.IsNotNull(hand.GetComponentInChildren<ArenaCardGesture>());
            Assert.IsTrue(arena.BeginCardDrag(id,true,Center(hand)));arena.EndCardDrag(new Vector2(-50,-50));
            Assert.AreEqual(4,arena.Battle.State.hand.Count);Assert.AreEqual(5,arena.Battle.State.playerEnergy);Assert.AreEqual(0,arena.Battle.State.discard.Count);
            Assert.IsTrue(arena.BeginCardDrag(id,true,Center(hand)));arena.MoveCardDrag(Center(rival.transform));arena.EndCardDrag(Center(rival.transform));
            Assert.IsTrue(arena.IsAnimating);Assert.AreEqual(4,arena.Battle.State.playerEnergy);Assert.AreEqual(1,arena.Battle.State.discard.Count);Assert.AreEqual(hp-4,arena.Battle.State.rivals[0].hp);
            yield return new WaitForSecondsRealtime(.85f);
            var impact=canvas.transform.Find("ElementalEffects/ElementalImpact_Fire");Assert.IsNotNull(impact);
            var nova=impact.GetComponentInChildren<UnityEngine.UI.RawImage>();Assert.IsNotNull(nova.texture);Assert.Greater(nova.rectTransform.rect.width,200);
            yield return new WaitForSecondsRealtime(1.1f);Assert.IsFalse(arena.IsAnimating);
            Assert.IsNull(canvas.transform.Find("ElementalEffects/DragPreview"));Assert.IsNull(canvas.transform.Find("ElementalEffects/ElementalImpact_Fire"));
            LogAssert.NoUnexpectedReceived();
        }
        [UnityTest] public IEnumerator DraggingOwnCreatureAttacksDroppedEnemy()
        {
            var arena=Object.FindFirstObjectByType<ArenaController>();if(arena==null)arena=new GameObject("TestArena").AddComponent<ArenaController>();
            while(arena.IsAnimating)yield return null;
            arena.StartNewMatch();yield return null;Canvas.ForceUpdateCanvases();
            var rival=arena.GetComponentInChildren<Canvas>().transform.Find("SafeArea/RivalCourt").GetComponentsInChildren<UnityEngine.UI.Button>()[1];
            string ally=arena.Battle.State.players[0].id;int hp=arena.Battle.State.rivals[1].hp;
            Assert.IsTrue(arena.BeginCardDrag(ally,false,Vector2.zero));arena.EndCardDrag(Center(rival.transform));
            Assert.IsTrue(arena.Battle.State.players[0].hasAttacked);Assert.AreEqual(ally,arena.Battle.State.selectedAlly);Assert.Less(arena.Battle.State.rivals[1].hp,hp);
            Assert.IsFalse(arena.BeginCardDrag(ally,false,Vector2.zero));
            yield return new WaitForSecondsRealtime(1.95f);Assert.IsFalse(arena.IsAnimating);LogAssert.NoUnexpectedReceived();
        }
    }
}
