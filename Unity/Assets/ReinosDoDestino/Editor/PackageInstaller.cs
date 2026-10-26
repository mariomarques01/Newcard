#if UNITY_EDITOR
using System.Linq;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

namespace ReinosDoDestino.Editor
{
    public static class PackageInstaller
    {
        static AddAndRemoveRequest request;
        static double deadline;
        public static void Install()
        {
            request=Client.AddAndRemove(new[]{"com.unity.ugui","com.unity.inputsystem","com.unity.render-pipelines.universal","com.unity.test-framework"},UnityEditor.PackageManager.PackageInfo.GetAllRegisteredPackages().Where(p=>p.name=="com.unity.multiplayer.center"||p.name=="com.unity.collab-proxy").Select(p=>p.name).ToArray());
            deadline=EditorApplication.timeSinceStartup+600;
            EditorApplication.update+=Poll;
        }
        static void Poll()
        {
            if(!request.IsCompleted){if(EditorApplication.timeSinceStartup>deadline){EditorApplication.update-=Poll;Debug.LogError("Package Manager timeout");EditorApplication.Exit(2);}return;}
            EditorApplication.update-=Poll;
            if(request.Status!=StatusCode.Success){Debug.LogError(request.Error.message);EditorApplication.Exit(1);return;}
            foreach(var package in request.Result)Debug.Log("[Elemental packages] "+package.name+"@"+package.version);
            EditorApplication.Exit(0);
        }
    }
}
#endif
