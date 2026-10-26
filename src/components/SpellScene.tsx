import {useEffect,useRef,useState} from 'react';
import {PROJECTILE_IMPACT_MS} from '../game/combatTiming';
import {spellFlight,SPELL_CHARGE_MS} from '../game/spellFlight';
import {drawElementalSpell} from './elementalSpellDrawing';
import {drawCombatImpact} from './impactDrawing';
import type {BattleEffect} from './CombatParticleCanvas';
const palette=(e:BattleEffect)=>e.school==='fogo'?['#ff771e','#fff1a0']:e.school==='agua'?['#38cfff','#e2fbff']:e.school==='terra'?['#82d34c','#f0ffd6']:['#c4eaff','#ffffff'];
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
    if(e.impact){drawCombatImpact(ctx,e,elapsed,reduce);continue;}
    const [color,light]=palette(e),delay=e.travel?PROJECTILE_IMPACT_MS:0,age=(elapsed-delay)/1000;
    const board=e.scope==='board',legendary=e.intensity==='legendary',radius=board?Math.min(w*.38,h*.2):legendary?82:64;
    // Charge, release and wake use the same path, so energy never detaches from its projectile.
    if(e.travel&&!reduce&&elapsed<PROJECTILE_IMPACT_MS){
     const f=spellFlight(e.from,e.to,elapsed),charge=Math.min(1,elapsed/SPELL_CHARGE_MS);
     const chargeFade=elapsed<SPELL_CHARGE_MS?charge:Math.max(0,1-f.progress*2);
     ctx.save();ctx.translate(e.from.x,e.from.y);ctx.rotate(elapsed*.002);
     ctx.globalAlpha=chargeFade*.8;ctx.strokeStyle=color;ctx.lineWidth=1.5;
     for(const r of [22+charge*8,32+charge*8]){ctx.beginPath();ctx.ellipse(0,0,r,r*.6,0,0,Math.PI*2);ctx.stroke();}
     for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.save();ctx.translate(Math.cos(a)*34,Math.sin(a)*20);ctx.rotate(a);ctx.strokeRect(-3,-3,6,6);ctx.restore();}
     ctx.restore();glow(e.from.x,e.from.y,28+charge*18,color,chargeFade*.45);
     if(elapsed>=SPELL_CHARGE_MS){
      for(let j=10;j>=0;j--){const tail=spellFlight(e.from,e.to,elapsed-j*13);glow(tail.x,tail.y,3+(10-j)*.9,color,(1-j/11)*.5);}
      glow(f.x,f.y,24,color,.95);glow(f.x,f.y,7,light,1);
      ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=1;ctx.strokeStyle=light;ctx.fillStyle=color;ctx.lineWidth=2;
      if(e.flavor==='ar'){
       // A narrow cutting crescent, rather than a large ring over neighboring cards.
       ctx.beginPath();ctx.moveTo(14,0);ctx.quadraticCurveTo(-10,-38,-24,-25);ctx.quadraticCurveTo(-4,0,-24,25);ctx.quadraticCurveTo(-10,38,14,0);ctx.fill();ctx.stroke();
      }else if(e.flavor==='fogo'){
       for(let k=0;k<7;k++)glow(-k*7,Math.sin(k*2+elapsed*.025)*(3+k),18-k,color,.7);
      }else if(e.flavor==='terra'){
       for(let k=0;k<4;k++){const a=k*Math.PI/2+elapsed*.01;ctx.save();ctx.translate(Math.cos(a)*17-10,Math.sin(a)*17);ctx.rotate(Math.PI/4);ctx.fillRect(-5,-5,10,10);ctx.strokeRect(-5,-5,10,10);ctx.restore();}
      }else if(e.flavor==='agua'){
       for(let k=0;k<5;k++){const a=k*Math.PI*2/5+elapsed*.006;ctx.save();ctx.translate(Math.cos(a)*18,Math.sin(a)*18);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,9,3,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      }else{
       // Two braided arcs visibly converge at the spell core.
       for(let k=0;k<2;k++){ctx.beginPath();for(let j=0;j<9;j++){const px=-48+j*7,py=Math.sin(j*1.4+elapsed*.025+k*Math.PI)*(8+j*.4);j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
      }
      ctx.restore();
     }
    }
    if(age<0||age>1.6)continue;
    const fade=Math.max(0,1-age/1.3),x=e.to.x,y=e.to.y;
    drawElementalSpell(ctx,e,age,color,light,reduce);
    if(reduce){glow(x,y,board?radius:48,color,fade*.3);continue;}
    if(legendary){
     // A second rotating seal distinguishes rare powers without a full-screen flash.
     ctx.save();ctx.translate(x,y);ctx.rotate(age*.55);ctx.strokeStyle=light;ctx.lineWidth=1.5;ctx.globalAlpha=fade*.65;
     for(const r of [48,56]){ctx.beginPath();ctx.arc(0,0,r+Math.min(age,.4)*18,0,Math.PI*2);ctx.stroke();}
     for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.beginPath();ctx.moveTo(42,0);ctx.lineTo(54,-5);ctx.lineTo(64,0);ctx.lineTo(54,5);ctx.closePath();ctx.stroke();ctx.restore();}
     ctx.restore();
    }
    // School-specific silhouettes stay around the recipient instead of washing out the arena.
    if(!e.variant){ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;ctx.strokeStyle=light;ctx.fillStyle=color;ctx.lineWidth=2;
    if(e.type==='shield'){
     const r=42+Math.min(age*30,12);ctx.globalAlpha=fade*.35;
     ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.75,-r*.55);ctx.lineTo(r*.6,r*.4);ctx.quadraticCurveTo(0,r*1.2,-r*.6,r*.4);ctx.lineTo(-r*.75,-r*.55);ctx.closePath();ctx.fill();ctx.globalAlpha=fade;ctx.stroke();
    }else if(e.school==='ar'){
     ctx.rotate(-.6);for(let i=0;i<3;i++){ctx.globalAlpha=fade*(1-i*.2);ctx.lineWidth=5-i;ctx.beginPath();ctx.moveTo(-38+i*12,-35);ctx.quadraticCurveTo(-6+i*12,0,28+i*12,38);ctx.stroke();}
    }else if(e.school==='agua'||e.type==='heal'){
     for(let i=0;i<7;i++){const a=i*Math.PI*2/7+age*.8,r=25+age*18;ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r-age*16);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
     if(e.type==='heal'){ctx.fillStyle=light;ctx.fillRect(-3,-16,6,32);ctx.fillRect(-16,-3,32,6);}
    }else if(e.school==='terra'){
     for(let i=0;i<7;i++){ctx.save();ctx.rotate(i*Math.PI*2/7);ctx.translate(24+age*20,0);ctx.rotate(i);ctx.fillRect(-6,-5,12,10);ctx.strokeRect(-6,-5,12,10);ctx.restore();}
    }else if(e.school==='fogo'){
     for(let i=0;i<8;i++){const a=i*Math.PI/4;glow(Math.cos(a)*(15+age*30),Math.sin(a)*(15+age*30)-age*25,15,color,fade*.8);}
    }else if(e.school==='ar'){
     ctx.rotate(-age);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.strokeRect(22,-8,16,16);}ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();}
    if(age<.65){
     ctx.save();ctx.translate(x,y);ctx.globalAlpha=(1-age/.65)*.75;ctx.strokeStyle=color;ctx.lineWidth=2;
     if(e.type==='shield'){
      // Ripples visibly propagate around the barrier where the hit was absorbed.
      for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,22+age*55+k*7,30+age*40+k*7,0,-Math.PI*.9,Math.PI*.7);ctx.stroke();}
     }else if(e.school==='fogo'){
      for(let k=0;k<6;k++){ctx.save();ctx.rotate(k*Math.PI/3);ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(-6,-22);ctx.lineTo(4,-30);ctx.lineTo(0,-48-age*20);ctx.stroke();ctx.restore();}
     }else if(e.school==='ar'){
      for(let k=0;k<2;k++){ctx.beginPath();for(let j=0;j<35;j++){const a=j*.2+age*4+k*Math.PI,r=8+j*.9;const px=Math.cos(a)*r,py=Math.sin(a)*r;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
     }
     ctx.restore();
    }
    const atlas=texture.current;
    if(atlas&&board&&(e.school==='fogo'||e.school==='agua')&&age<1.45){
     const cellX=e.school==='agua'?1:0;
     const cellY=0;
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
    const count=legendary?40:board?36:24;
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
