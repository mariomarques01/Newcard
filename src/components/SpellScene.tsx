import {useEffect,useRef,useState} from 'react';
import type {BattleEffect} from './CombatParticleCanvas';
const palette=(e:BattleEffect)=>e.school==='steel'?['#71cfff','#e7faff']:e.school==='nature'?['#62e9aa','#effff2']:e.school==='solar'?['#ffca5b','#fff6d2']:e.school==='storm'?['#b58aff','#f3e8ff']:e.school==='wild'?['#ff79c5','#ffe7f7']:e.type==='heal'?['#56ffb7','#ddffef']:e.type==='shield'?['#48ceff','#d9f9ff']:e.flavor==='flame'?['#ff771e','#fff1a0']:e.flavor==='blade'?['#67cbff','#ecfaff']:e.type==='gold_blast'||e.flavor==='coin'?['#ffd34b','#fff6c4']:['#b967ff','#f4ddff'];
const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export function SpellScene({effects}:{effects:BattleEffect[]}){
 const canvas=useRef<HTMLCanvasElement>(null),live=useRef(effects),raf=useRef(0);
 useEffect(()=>{live.current=effects},[effects]);
 const texture=useRef<HTMLImageElement|null>(null);
 const [textureReady,setTextureReady]=useState(false);
 useEffect(()=>{const img=new Image();img.onload=()=>{texture.current=img;setTextureReady(true)};img.src=`${import.meta.env.BASE_URL}assets/effects/elemental-novas.webp`;return()=>{img.onload=null;texture.current=null}},[]);
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
    const elapsed=now-e.started;if(elapsed<0||elapsed>2500)continue;
    const [color,light]=palette(e),delay=e.travel?880:0,age=(elapsed-delay)/1000;
    const board=e.scope==='board',radius=board?Math.min(w*.38,h*.2):64;
    // Charge at the caster, then a glowing projectile with an arcing particle wake.
    if(e.travel&&!reduce&&elapsed<940){
     const p=Math.max(0,Math.min(1,(elapsed-300)/580));const arc=Math.sin(p*Math.PI)*Math.min(45,Math.abs(e.to.x-e.from.x)*.12+18);
     const x=e.from.x+(e.to.x-e.from.x)*p,y=e.from.y+(e.to.y-e.from.y)*p-arc;
     glow(e.from.x,e.from.y,32+elapsed*.035,color,(1-p)*.7);
     for(let j=15;j>=0;j--){const q=Math.max(0,p-j*.017),tx=e.from.x+(e.to.x-e.from.x)*q,ty=e.from.y+(e.to.y-e.from.y)*q-Math.sin(q*Math.PI)*Math.min(45,Math.abs(e.to.x-e.from.x)*.12+18);glow(tx,ty,3+(15-j)*.8,color,(1-j/16)*.55);}
     glow(x,y,26,color,1);glow(x,y,8,light,1);
     for(let j=0;j<5;j++){const a=elapsed*.017+j*1.256;glow(x+Math.cos(a)*17,y+Math.sin(a)*12,3,light,.9);}
    }
    if(e.travel&&!reduce&&elapsed>=300&&elapsed<1150){
     const t=Math.min(1,(elapsed-300)/580),dx=e.to.x-e.from.x,dy=e.to.y-e.from.y;
     ctx.save();ctx.translate(e.from.x+dx*t,e.from.y+dy*t);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=Math.min(1,(1150-elapsed)/250);
     if(e.flavor==='blade'){
      ctx.strokeStyle=light;ctx.lineWidth=5;ctx.shadowColor=color;ctx.shadowBlur=18;
      for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(-k*14,0,42+k*13,-1.2,1.2);ctx.stroke();}
     }else if(e.flavor==='flame'){
      for(let k=0;k<12;k++){const a=noise(e.id+k)*Math.PI*2;glow(-k*7,Math.sin(a+elapsed*.01)*(12+k),25-k,color,.8);}
     }else if(e.flavor==='coin'){
      for(let k=0;k<9;k++){const a=k*2.4+elapsed*.009;ctx.fillStyle='#ffdc56';ctx.strokeStyle='#fff3bd';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(Math.cos(a)*45-k*5,Math.sin(a)*35,9,12,elapsed*.005,0,Math.PI*2);ctx.fill();ctx.stroke();}
     }else if(e.flavor==='heart'){
      ctx.fillStyle='#ffa3ce';ctx.font='bold 32px Georgia';for(let k=0;k<5;k++){const a=k*1.25+elapsed*.008;ctx.fillText('♥',Math.cos(a)*36-16,Math.sin(a)*36+10);}
     }else{
      ctx.strokeStyle='#d69aff';ctx.lineWidth=3;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-70,k*12-18);for(let j=0;j<9;j++)ctx.lineTo(-70+j*12,(noise(e.id+k+j)*45-22)+k*8);ctx.stroke();}
     }ctx.restore();
    }
    if(age<0||age>1.6)continue;
    const fade=Math.max(0,1-age/1.3),x=e.to.x,y=e.to.y;
    if(reduce){glow(x,y,board?radius:48,color,fade*.3);continue;}
    // School-specific silhouettes stay around the recipient instead of washing out the arena.
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;ctx.strokeStyle=light;ctx.fillStyle=color;ctx.lineWidth=2;
    if(e.type==='shield'){
     const r=42+Math.min(age*30,12);ctx.globalAlpha=fade*.35;
     ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.75,-r*.55);ctx.lineTo(r*.6,r*.4);ctx.quadraticCurveTo(0,r*1.2,-r*.6,r*.4);ctx.lineTo(-r*.75,-r*.55);ctx.closePath();ctx.fill();ctx.globalAlpha=fade;ctx.stroke();
    }else if(e.school==='steel'||(!e.school&&(e.type==='slash'||e.type==='pierce'))){
     ctx.rotate(-.6);for(let i=0;i<3;i++){ctx.globalAlpha=fade*(1-i*.2);ctx.lineWidth=5-i;ctx.beginPath();ctx.moveTo(-38+i*12,-35);ctx.quadraticCurveTo(-6+i*12,0,28+i*12,38);ctx.stroke();}
    }else if(e.school==='nature'||e.type==='heal'){
     for(let i=0;i<7;i++){const a=i*Math.PI*2/7+age*.8,r=25+age*18;ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r-age*16);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
     ctx.fillStyle=light;ctx.fillRect(-3,-16,6,32);ctx.fillRect(-16,-3,32,6);
    }else if(e.school==='solar'){
     ctx.rotate(age*.5);for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(38+age*15,-4);ctx.lineTo(32+age*15,5);ctx.closePath();ctx.fill();}ctx.strokeRect(-15,-15,30,30);
    }else if(e.school==='storm'){
     for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);ctx.beginPath();ctx.moveTo(-8,-60);for(let j=1;j<=6;j++)ctx.lineTo((noise(e.id+i*11+j+Math.floor(age*12))*2-1)*15,-60+j*10);ctx.stroke();ctx.restore();}
    }else if(e.school==='wild'){
     ctx.rotate(-age);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.strokeRect(22,-8,16,16);}ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
    const atlas=texture.current;
    if(atlas&&board&&age<1.45){
     const cellX=e.type==='shield'||e.flavor==='blade'?1:e.type==='gold_blast'||e.flavor==='coin'||e.type==='heal'?1:0;
     const cellY=e.type==='shield'||e.flavor==='blade'||e.flavor==='flame'?0:1;
     const halfW=atlas.naturalWidth/2,halfH=atlas.naturalHeight/2;
     const r=(board?radius*.9:e.type==='shield'?100:130)*(.55+Math.min(age*2,1));
     ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,Math.min(1,age*9))*(1-age/1.5)*.88;
     ctx.translate(x,y);ctx.rotate((e.type==='shield'?0:age*.3));ctx.drawImage(atlas,cellX*halfW,cellY*halfH,halfW,halfH,-r,-r,r*2,r*2);ctx.restore();
    }
    // A brief local flash, expanding shock wave and drifting colored smoke.
    glow(x,y,(board?radius:95)*(1+age*.4),color,Math.max(0,1-age*4)*.7);
    const ringR=10+Math.min(age,.65)*radius*1.5;
    ctx.globalAlpha=fade*.8;ctx.strokeStyle=light;ctx.lineWidth=Math.max(.5,3*(1-age));ctx.beginPath();ctx.ellipse(x,y,ringR,ringR*(board?.48:.8),0,0,Math.PI*2);ctx.stroke();
    if(e.type==='shield'){
     ctx.save();ctx.translate(x,y);ctx.rotate(age*.2);ctx.globalAlpha=fade*.65;ctx.strokeStyle=color;ctx.lineWidth=1.5;
     // Interlocking hexagonal cells form the spherical magical barrier.
     for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){
      const hx=col*22+(row%2)*11,hy=row*19;if(hx*hx+hy*hy>2500)continue;
      ctx.beginPath();for(let k=0;k<7;k++){const a=k*Math.PI/3;const px=hx+Math.cos(a)*12,py=hy+Math.sin(a)*12;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke();
     }ctx.restore();glow(x,y,65,color,fade*.22);
    }
    const count=board?36:24;
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
 return <canvas ref={canvas} className="spell-scene" data-texture-ready={textureReady} aria-hidden="true"/>;
}
