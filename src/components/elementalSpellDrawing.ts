import type {BattleEffect} from './CombatParticleCanvas';
/** Bounded, deterministic silhouettes: no allocations of textures or screen flashes. */
export function drawElementalSpell(ctx:CanvasRenderingContext2D,e:BattleEffect,age:number,color:string,light:string,reduced:boolean){
 if(!e.variant||age<0||age>1.45)return;
 const fade=Math.max(0,1-age/1.45),rise=Math.min(1,age/.24),radius=e.scope==='board'?85:48;
 ctx.save();ctx.translate(e.to.x,e.to.y);ctx.strokeStyle=light;ctx.fillStyle=color;ctx.lineWidth=2;ctx.globalAlpha=fade*.8;
 if(reduced){ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,30,38,0,0,Math.PI*2);ctx.stroke();ctx.restore();return;}
 switch(e.variant){
 case 'elemental-barrier':
  ctx.globalAlpha=fade*.18;ctx.beginPath();ctx.ellipse(0,0,40,52,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=fade*.85;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,38+i*4,48+i*4,Math.sin(age*2)*.1,-Math.PI*.9+age*.7,Math.PI*.7+age*.7);ctx.stroke();}
  for(let i=0;i<8;i++){const a=i*Math.PI/4+age;ctx.save();ctx.translate(Math.cos(a)*44,Math.sin(a)*54);if(e.school==='fogo'){ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();}else{ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.stroke();}ctx.restore();}break;
 case 'fireball':
  for(let i=0;i<12;i++){const a=i*Math.PI/6,r=(12+age*58);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r-age*22);ctx.rotate(a+age);ctx.globalAlpha=fade*(i%2?.6:.9);ctx.beginPath();ctx.moveTo(0,-16*fade);ctx.quadraticCurveTo(13,3,0,12);ctx.quadraticCurveTo(-10,0,0,-16*fade);ctx.fill();ctx.restore();}break;
 case 'tidal-wave':
  for(let i=0;i<5;i++){const y=-35+i*17,x=Math.sin(age*5+i)*12;ctx.globalAlpha=fade*(.8-i*.1);ctx.lineWidth=5-i*.65;ctx.beginPath();ctx.moveTo(-radius+x,y);ctx.bezierCurveTo(-20+x,y-28,20+x,y+25,radius+x,y-8);ctx.stroke();}break;
 case 'earth-eruption':
  for(let i=0;i<7;i++){const x=(i-3)*14,h=(22+(i%3)*15)*rise;ctx.save();ctx.translate(x,27);ctx.globalAlpha=fade;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-6,-h*.6);ctx.lineTo(3,-h);ctx.lineTo(10,-h*.45);ctx.lineTo(8,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,28);ctx.lineTo((i-2)*13,37);ctx.lineTo((i-2)*26,33+age*20);ctx.stroke();}break;
 case 'stone-armor':
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=radius*(1.3-rise*.3);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r*.9);ctx.rotate(a);ctx.globalAlpha=fade*.75;ctx.beginPath();ctx.moveTo(-8,-12);ctx.lineTo(8,-9);ctx.lineTo(10,11);ctx.lineTo(-7,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}break;
 case 'tornado':
  for(let row=0;row<10;row++){const y=35-row*9,r=9+row*3.5;ctx.globalAlpha=fade*(.4+row*.05);ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(Math.sin(age*9+row*.45)*7,y,r,5+row*.5,age*.7,0,Math.PI*1.75);ctx.stroke();}
  for(let i=0;i<7;i++){const a=age*8+i*.9;ctx.fillRect(Math.cos(a)*40,Math.sin(a)*18-25,3,3);}break;
 case 'wind-blades':
  for(let i=0;i<4;i++){ctx.save();ctx.rotate(-.5+i*.24);ctx.translate(age*22-8,i*10-16);ctx.lineWidth=4-i*.6;ctx.beginPath();ctx.moveTo(-45,-20);ctx.quadraticCurveTo(12,-46,45,12);ctx.stroke();ctx.restore();}break;
 case 'healing-spring':
 case 'forest-renewal':
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9+age*.9,r=radius*.7;ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r*.5-age*34);ctx.rotate(e.variant==='forest-renewal'?a:0);ctx.beginPath();if(e.variant==='forest-renewal')ctx.ellipse(0,0,9,4,0,0,Math.PI*2);else{ctx.moveTo(0,-10);ctx.bezierCurveTo(12,1,7,9,0,9);ctx.bezierCurveTo(-7,9,-12,1,0,-10);}ctx.fill();ctx.restore();}
  ctx.fillStyle=light;ctx.fillRect(-3,-14,6,28);ctx.fillRect(-14,-3,28,6);break;
 }
 ctx.restore();
}
