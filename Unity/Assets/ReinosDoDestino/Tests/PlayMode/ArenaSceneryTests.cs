using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using ReinosDoDestino.Unity;

public class ArenaSceneryTests
{
    [UnityTest]
    public IEnumerator NativeArenaRetainsTenSlotsAndAFreeBattlefield()
    {
        var arena=Object.FindFirstObjectByType<ArenaController>();
        if(arena==null)arena=new GameObject("ArenaSceneryTest").AddComponent<ArenaController>();
        yield return null;Canvas.ForceUpdateCanvases();
        var scenery=arena.GetComponent<ArenaScenery3D>();Assert.IsNotNull(scenery);Assert.AreEqual(13,scenery.BatchCount);
        var canvas=arena.GetComponentInChildren<Canvas>();
        var rival=canvas.transform.Find("SafeArea/RivalCourt");var player=canvas.transform.Find("SafeArea/PlayerCourt");
        Assert.AreEqual(3,rival.GetComponentsInChildren<UnityEngine.UI.Button>().Length);
        Assert.AreEqual(3,player.GetComponentsInChildren<UnityEngine.UI.Button>().Length);
        Assert.IsNotNull(rival.Find("EmptySlot_3"));Assert.IsNotNull(rival.Find("EmptySlot_4"));
        Assert.IsNotNull(player.Find("EmptySlot_3"));Assert.IsNotNull(player.Find("EmptySlot_4"));
        Assert.Greater(((RectTransform)rival).anchorMin.y-((RectTransform)player).anchorMax.y,.35f);
        Assert.IsFalse(canvas.transform.Find("SafeArea/NativeArena3D").GetComponent<UnityEngine.UI.RawImage>().raycastTarget);
        Assert.AreEqual(5,canvas.transform.Find("SafeArea/Actions").GetComponentsInChildren<UnityEngine.UI.Button>().Length);
    }
}
