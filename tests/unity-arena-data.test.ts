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

test('Unity export preserves the GLB camera, punctual lights and PBR material values',()=>{
 const data=JSON.parse(fs.readFileSync('Unity/Assets/Resources/Elemental/Arena/arena.json','utf8'));
 const bytes=fs.readFileSync('public/assets/arena/elemental-arena.glb');
 const source=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 assert.equal(data.camera.halfHeight,source.cameras[0].orthographic.ymag);
 assert.equal(data.camera.halfWidth,source.cameras[0].orthographic.xmag);
 assert.deepEqual(data.camera.position,[0,35,-24]);
 const sourceLights=source.extensions.KHR_lights_punctual.lights;
 assert.equal(data.lights.length,sourceLights.length);
 for(let i=0;i<sourceLights.length;i++){
  assert.equal(data.lights[i].type,sourceLights[i].type);
  assert.equal(data.lights[i].intensity,sourceLights[i].intensity);
  assert.deepEqual(data.lights[i].color,sourceLights[i].color||[1,1,1]);
 }
 for(const material of source.materials){
  const exported=data.meshes.find((m:{name:string})=>m.name===material.name);
  assert.ok(exported,material.name);
  assert.equal(exported.metallic,material.pbrMetallicRoughness.metallicFactor??1);
  assert.equal(exported.roughness,material.pbrMetallicRoughness.roughnessFactor??1);
  assert.equal(exported.doubleSided,!!material.doubleSided);
  const strength=material.extensions?.KHR_materials_emissive_strength?.emissiveStrength??1;
  assert.deepEqual(exported.emission,(material.emissiveFactor||[0,0,0]).map((x:number)=>x*strength));
 }
 assert.equal(data.lights.filter((l:{shadows:boolean})=>l.shadows).length,1);
});
