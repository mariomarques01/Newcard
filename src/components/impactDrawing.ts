import type {BattleEffect} from './CombatParticleCanvas';
/** Local silhouettes for resolved outcomes. Maximum footprint stays near one hero. */
export function drawCombatImpact(ctx:CanvasRenderingContext2D,e:BattleEffect,elapsed:number,reduced:boolean){
 const t=elapsed/1000;if(t<0||t>.95)return;
 const barrier=e.impact==='blocked'||e.impact==='shield-break';
 const color=barrier?'#8ee9ff':e.impact==='lethal'?'#ffe09b':'#ffb998';
 ctx.save();ctx.translate(e.to.x,e.to.y);ctx.globalAlpha=Math.max(0,1-t/.95);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
 if(reduced){ctx.strokeRect(-32,-40,64,80);ctx.restore();return;}
 if(e.impact==='shield-break'){
  // Twelve discrete crystal fragments travel away from the ruptured barrier.
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,r=24+t*(38+i%3*12);
   ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r*.9+t*t*25);ctx.rotate(a+t*(i%2?3:-3));
   ctx.globalAlpha=Math.max(0,1-t/.8);ctx.beginPath();ctx.moveTo(-5,-11);ctx.lineTo(7,-3);ctx.lineTo(2,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
 }else if(e.impact==='blocked'){
  ctx.beginPath();ctx.moveTo(0,-44);ctx.lineTo(33,-30);ctx.lineTo(28,15);ctx.quadraticCurveTo(15,35,0,46);ctx.quadraticCurveTo(-15,35,-28,15);ctx.lineTo(-33,-30);ctx.closePath();
  ctx.globalAlpha=(1-t/.95)*.18;ctx.fill();ctx.globalAlpha=Math.max(0,1-t/.95);ctx.stroke();
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-5,12+t*35+i*7,15+t*35+i*7,0,-2.5,1);ctx.stroke();}
 }else if(e.impact==='lethal'){
  for(const r of [32+t*34,39+t*34]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4+t*.3);ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(42+t*27,0);ctx.stroke();ctx.restore();}
 }else{
  ctx.rotate(-.6);ctx.lineWidth=e.impact==='heavy'?4:2;
  const extent=e.impact==='heavy'?48:29;
  for(let i=0;i<(e.impact==='heavy'?3:1);i++){ctx.beginPath();ctx.moveTo(-extent+i*10,-extent*.6);ctx.lineTo(extent-i*9,extent*.6);ctx.stroke();}
 }
 ctx.restore();
}
