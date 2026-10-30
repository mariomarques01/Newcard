import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

test('Unity geometry export matches the approved asset and remains inside mobile budgets',()=>{
 const data=JSON.parse(fs.readFileSync('Unity/Assets/Resources/Elemental/Arena/arena.json','utf8'));
 assert.equal(data.sourceSha256,crypto.createHash('sha256').update(fs.readFileSync('public/assets/arena/elemental-arena.glb')).digest('hex'));
 assert.equal(data.slots,10);assert.equal(data.meshes.length,13);
 let triangles=0;
 for(const mesh of data.meshes){
  assert.equal(mesh.positions.length%3,0);assert.equal(mesh.positions.length,mesh.normals.length);
  assert.equal(mesh.triangles.length%3,0);assert.equal(mesh.color.length,4);assert.equal(mesh.emission.length,3);
  assert.ok(mesh.positions.every(Number.isFinite));assert.ok(mesh.normals.every(Number.isFinite));
  assert.ok(mesh.triangles.every((index:number)=>Number.isInteger(index)&&index>=0&&index<mesh.positions.length/3));
  for(let i=0;i<mesh.normals.length;i+=3){const length=Math.hypot(...mesh.normals.slice(i,i+3));assert.ok(Math.abs(length-1)<.001);}
  triangles+=mesh.triangles.length/3;
 }
 assert.equal(triangles,53228);
});
