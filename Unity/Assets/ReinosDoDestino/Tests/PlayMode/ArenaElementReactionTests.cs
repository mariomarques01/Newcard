using System.Collections;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using ReinosDoDestino.Core;
using ReinosDoDestino.Unity;

namespace ReinosDoDestino.Tests
{
    public sealed class ArenaElementReactionTests
    {
        [UnityTest] public IEnumerator ElementsAndDefenseRenderDifferentGeometry()
        {
            var canvas=new GameObject("ElementShapeTest",typeof(Canvas));canvas.GetComponent<Canvas>().renderMode=RenderMode.ScreenSpaceOverlay;
            var attacks=new HashSet<string>();var guards=new HashSet<string>();
            foreach(Element element in System.Enum.GetValues(typeof(Element)))
            {
                string attack=null;
                foreach(var action in new[]{ElementalVfxAction.Strike,ElementalVfxAction.Guard})
                {
                    var go=new GameObject("Shape",typeof(RectTransform),typeof(ElementalVfxGraphic));go.transform.SetParent(canvas.transform,false);
                    var graphic=go.GetComponent<ElementalVfxGraphic>();graphic.rectTransform.sizeDelta=new Vector2(300,450);
                    graphic.Initialize(element,ElementalVfxPhase.Impact,action,0);
                    yield return null;Canvas.ForceUpdateCanvases();
                    var rendered=graphic.canvasRenderer.GetMesh();Assert.Greater(rendered.vertexCount,20);
                    string signature=rendered.vertexCount+":"+string.Join(",",rendered.vertices.Take(18).Select(v=>Mathf.RoundToInt(v.x)+"/"+Mathf.RoundToInt(v.y)));
                    if(action==ElementalVfxAction.Strike){attack=signature;attacks.Add(signature);}else{Assert.AreNotEqual(attack,signature,element+": defesa não pode repetir a geometria do ataque");guards.Add(signature);}
                    Assert.IsFalse(graphic.raycastTarget);Object.Destroy(go);
                }
            }
            Assert.AreEqual(4,attacks.Count);Assert.AreEqual(4,guards.Count);Object.Destroy(canvas);LogAssert.NoUnexpectedReceived();
        }
        [UnityTest] public IEnumerator FireGuardPersistsThenClearsAndRivalWaterGuardHasItsOwnElement()
        {
            var arena=Object.FindFirstObjectByType<ArenaController>();if(arena==null)arena=new GameObject("TestArena").AddComponent<ArenaController>();
            while(arena.IsAnimating)yield return null;
            arena.StartNewMatch();yield return null;Canvas.ForceUpdateCanvases();
            arena.Battle.SelectAlly("p_valete_paus");
            var canvas=arena.GetComponentInChildren<Canvas>();var controls=canvas.transform.Find("SafeArea/Actions").GetComponentsInChildren<UnityEngine.UI.Button>();
            controls[2].onClick.Invoke();yield return new WaitForSecondsRealtime(3f);
            Assert.IsTrue(canvas.GetComponentsInChildren<ElementalVfxGraphic>().Any(g=>g.Element==Element.Fire&&g.Phase==ElementalVfxPhase.Ward));
            arena.Battle.State.rivals[1].hp=1;
            controls[4].onClick.Invoke();yield return new WaitForSecondsRealtime(.9f);
            Assert.IsFalse(canvas.GetComponentsInChildren<ElementalVfxGraphic>().Any(g=>g.Element==Element.Fire&&g.Phase==ElementalVfxPhase.Ward));
            Assert.IsTrue(canvas.GetComponentsInChildren<ElementalVfxGraphic>().Any(g=>g.Element==Element.Water&&g.Phase==ElementalVfxPhase.Ward));
            yield return new WaitForSecondsRealtime(2.1f);LogAssert.NoUnexpectedReceived();
        }
    }
}
