// The arena now uses URP's native metallic/roughness lighting passes.
// Keep the Resources path stable so existing scene code loads the shader offline.
Shader "Reinos/ArenaMobile"
{
    Properties
    {
        _BaseColor("Color",Color)=(1,1,1,1)
        _BaseMap("Base Map",2D)="white" {}
        _Metallic("Metallic",Range(0,1))=0
        _Smoothness("Smoothness",Range(0,1))=.2
        _MetallicGlossMap("Metallic Map",2D)="white" {}
        [HDR] _EmissionColor("Emission",Color)=(0,0,0,1)
        _EmissionMap("Emission Map",2D)="white" {}
        _BumpMap("Normal Map",2D)="bump" {}
        _BumpScale("Normal Scale",Float)=1
        _OcclusionMap("Occlusion Map",2D)="white" {}
        _OcclusionStrength("Occlusion Strength",Range(0,1))=1
        _Cutoff("Alpha Cutoff",Range(0,1))=.5
        [HideInInspector] _WorkflowMode("Workflow",Float)=1
        [HideInInspector] _SpecColor("Specular",Color)=(.2,.2,.2,1)
        [HideInInspector] _SpecularHighlights("Specular Highlights",Float)=1
        [HideInInspector] _EnvironmentReflections("Environment Reflections",Float)=1
        [HideInInspector] _Surface("Surface",Float)=0
        [HideInInspector] _Blend("Blend",Float)=0
        [HideInInspector] _AlphaClip("Alpha Clip",Float)=0
        [HideInInspector] _SrcBlend("Source Blend",Float)=1
        [HideInInspector] _DstBlend("Destination Blend",Float)=0
        [HideInInspector] _SrcBlendAlpha("Source Alpha",Float)=1
        [HideInInspector] _DstBlendAlpha("Destination Alpha",Float)=0
        [HideInInspector] _ZWrite("Z Write",Float)=1
        [HideInInspector] _ZTest("Z Test",Float)=4
        [HideInInspector] _Cull("Cull",Float)=0
        [HideInInspector] _AlphaToMask("Alpha To Mask",Float)=0
        [HideInInspector] _ReceiveShadows("Receive Shadows",Float)=1
    }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
        UsePass "Universal Render Pipeline/Lit/ForwardLit"
        UsePass "Universal Render Pipeline/Lit/ShadowCaster"
        UsePass "Universal Render Pipeline/Lit/DepthOnly"
        UsePass "Universal Render Pipeline/Lit/DepthNormals"
    }
}
