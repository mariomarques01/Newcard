using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.TestTools;
using ReinosDoDestino.Unity;

namespace ReinosDoDestino.Tests
{
    public sealed class ArenaSmokeTests
    {
        [UnityTest] public IEnumerator NativeArenaControlsStayInsideSafeAreaAndAttackWorks()
        {
            var arena=Object.FindFirstObjectByType<ArenaController>();
            if(arena==null)arena=new GameObject("TestArena").AddComponent<ArenaController>();
            arena.StartNewMatch();
            yield return null;yield return null;
            Assert.IsNotNull(Object.FindFirstObjectByType<EventSystem>());
            var canvas=arena.GetComponentInChildren<Canvas>();Assert.IsNotNull(canvas.GetComponent<UnityEngine.UI.GraphicRaycaster>());
            var controls=canvas.transform.Find("SafeArea/Actions").GetComponentsInChildren<UnityEngine.UI.Button>();
            Assert.AreEqual(5,controls.Length);
            foreach(var button in controls){var corners=new Vector3[4];button.GetComponent<RectTransform>().GetWorldCorners(corners);Assert.Greater(corners[2].x,corners[0].x);Assert.GreaterOrEqual(corners[0].y,Screen.safeArea.yMin-1);Assert.LessOrEqual(corners[2].y,Screen.safeArea.yMax+1);}
            controls[1].onClick.Invoke();
            yield return new WaitForSeconds(3f);
            Assert.IsTrue(arena.Battle.State.players.Find(c=>c.id==arena.Battle.State.selectedAlly).hasAttacked);
            int frame=Time.frameCount;yield return null;Assert.Greater(Time.frameCount,frame,"O Player Loop deve avançar.");
            if(!Application.isBatchMode)
            {
                yield return new WaitForEndOfFrame();
                var capture=ScreenCapture.CaptureScreenshotAsTexture();
                Assert.IsNotNull(capture);Assert.Greater(capture.width,0);
                System.IO.Directory.CreateDirectory("Screenshots");System.IO.File.WriteAllBytes("Screenshots/native-arena.png",capture.EncodeToPNG());Object.Destroy(capture);
            }
            LogAssert.NoUnexpectedReceived();
        }
    }
}
