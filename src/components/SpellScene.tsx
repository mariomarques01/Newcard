import {useEffect,useRef} from 'react';
import type {BattleEffect} from './CombatParticleCanvas';
const palette=(e:BattleEffect)=>e.type==='heal'?['#56ffb7','#ddffef']:e.type==='shield'?['#48ceff','#d9f9ff']:e.flavor==='flame'?['#ff771e','#fff1a0']:e.flavor==='blade'?['#67cbff','#ecfaff']:e.type==='gold_blast'||e.flavor==='coin'?['#ffd34b','#fff6c4']:['#b967ff','#f4ddff'];
const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export function SpellScene({effects}:{effects:BattleEffect[]}){
 const canvas=useRef<HTMLCanvasElement>(null),live=useRef(effects),raf=useRef(0);
 useEffect(()=>{live.current=effects},[effects]);
 const running=effects.length>0;
 useEffect(()=>{
  if(!running)return;
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w=0,h=0;
  const resize=()=>{w=window.innerWidth;h=window.innerHeight;const dpr=Math.min(window.devicePixelRatio||1,1.5);el.width=w*dpr;el.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  resize();window.addEventListener('resize',resize);
  const glow=(x:number,y:number,r:number,color:string,alpha:number)=>{
   if(r<=0||alpha<=0)return;ctx.globalAlpha=Math.min(1,alpha);const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.12,color);g.addColorStop(.45,color+'88');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  };
  const draw=()=>{
   ctx.clearRect(0,0,w,h);const now=performance.now();ctx.globalCompositeOperation='screen';
   for(const e of live.current){
    const elapsed=now-e.started;if(elapsed<0||elapsed>1900)continue;
    const [color,light]=palette(e),delay=e.travel?580:0,age=(elapsed-delay)/1000;
    const board=e.scope==='board',radius=board?Math.min(w*.7,h*.45):68;
    // Charge at the caster, then a glowing projectile with an arcing particle wake.
    if(e.travel&&!reduce&&elapsed<620){
     const p=Math.max(0,Math.min(1,(elapsed-140)/440));const arc=Math.sin(p*Math.PI)*Math.min(45,Math.abs(e.to.x-e.from.x)*.12+18);
     const x=e.from.x+(e.to.x-e.from.x)*p,y=e.from.y+(e.to.y-e.from.y)*p-arc;
     glow(e.from.x,e.from.y,32+elapsed*.035,color,(1-p)*.7);
     for(let j=15;j>=0;j--){const q=Math.max(0,p-j*.017),tx=e.from.x+(e.to.x-e.from.x)*q,ty=e.from.y+(e.to.y-e.from.y)*q-Math.sin(q*Math.PI)*Math.min(45,Math.abs(e.to.x-e.from.x)*.12+18);glow(tx,ty,3+(15-j)*.8,color,(1-j/16)*.55);}
     glow(x,y,26,color,1);glow(x,y,8,light,1);
     for(let j=0;j<5;j++){const a=elapsed*.017+j*1.256;glow(x+Math.cos(a)*17,y+Math.sin(a)*12,3,light,.9);}
    }
    if(age<0||age>1.25)continue;
    const fade=Math.max(0,1-age/.95),x=e.to.x,y=e.to.y;
    if(reduce){glow(x,y,board?radius:48,color,fade*.3);continue;}
    // A brief local flash, expanding shock wave and drifting colored smoke.
    glow(x,y,(board?radius:95)*(1+age*.4),color,Math.max(0,1-age*4)*.7);
    const ringR=10+age*radius*2.3;
    ctx.globalAlpha=fade*.8;ctx.strokeStyle=light;ctx.lineWidth=Math.max(.5,3*(1-age));ctx.beginPath();ctx.ellipse(x,y,ringR,ringR*(board?.48:.8),0,0,Math.PI*2);ctx.stroke();
    if(e.type==='shield'){
     ctx.save();ctx.translate(x,y);ctx.rotate(age*.2);ctx.globalAlpha=fade*.65;ctx.strokeStyle=color;ctx.lineWidth=1.5;
     // Interlocking hexagonal cells form the spherical magical barrier.
     for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){
      const hx=col*22+(row%2)*11,hy=row*19;if(hx*hx+hy*hy>2500)continue;
      ctx.beginPath();for(let k=0;k<7;k++){const a=k*Math.PI/3;const px=hx+Math.cos(a)*12,py=hy+Math.sin(a)*12;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke();
     }ctx.restore();glow(x,y,65,color,fade*.22);
    }
    const count=board?68:30;
    for(let i=0;i<count;i++){
     const seed=e.id*91+i,angle=noise(seed)*Math.PI*2,speed=(20+noise(seed+3)*radius*1.8),life=.45+noise(seed+9)*.65;
     if(age>life)continue;
     const drift=e.type==='heal'?-age*52:age*age*55;
     const px=x+Math.cos(angle)*speed*age,py=y+Math.sin(angle)*speed*age+drift;
     ctx.globalAlpha=Math.max(0,1-age/life);ctx.fillStyle=i%4?color:light;
     const size=(1.5+noise(seed+7)*3)*(1-age/life);
     ctx.beginPath();ctx.arc(px,py,Math.max(.2,size),0,Math.PI*2);ctx.fill();
     if(i%6===0)glow(px,py,12+age*20,color,(1-age/life)*.13);
    }
    if(board){
     ctx.save();ctx.translate(x,y);ctx.scale(1,.5);ctx.rotate(age*.3);ctx.globalAlpha=fade*.5;ctx.strokeStyle=color;ctx.lineWidth=2;
     ctx.beginPath();ctx.arc(0,0,radius*.65,0,Math.PI*2);ctx.stroke();
     for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.strokeRect(radius*.55,-5,10,10)}ctx.restore();
    }
   }
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';raf.current=requestAnimationFrame(draw);
  };raf.current=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize);ctx.clearRect(0,0,w,h)};
 },[running]);
 return <canvas ref={canvas} className="spell-scene" aria-hidden="true"/>;
}
