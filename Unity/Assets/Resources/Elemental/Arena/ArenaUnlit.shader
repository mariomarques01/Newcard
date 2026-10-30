Shader "Reinos/ArenaMobile"
{
    Properties { _BaseColor("Color",Color)=(1,1,1,1) _Emission("Emission",Color)=(0,0,0,1) }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry" }
        Pass
        {
            Tags { "LightMode"="SRPDefaultUnlit" }
            ZWrite On Cull Back
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            struct Attributes { float4 positionOS:POSITION; float3 normalOS:NORMAL; };
            struct Varyings { float4 positionCS:SV_POSITION; half3 normalWS:TEXCOORD0; };
            CBUFFER_START(UnityPerMaterial)
            half4 _BaseColor; half4 _Emission;
            CBUFFER_END
            Varyings vert(Attributes i) { Varyings o; o.positionCS=TransformObjectToHClip(i.positionOS.xyz);o.normalWS=TransformObjectToWorldNormal(i.normalOS);return o; }
            half4 frag(Varyings i):SV_Target
            {
                half shade=.38h+.62h*saturate(dot(normalize(i.normalWS),normalize(half3(-.4,.85,-.3))));
                return half4(_BaseColor.rgb*shade+_Emission.rgb,1);
            }
            ENDHLSL
        }
    }
}
