/** Bake the approved GLB into native Unity mesh data; no runtime glTF dependency. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const source='public/assets/arena/elemental-arena.glb';
const bytes=fs.readFileSync(source);
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const batches=new Map(); let slots=0;
gltf.scene.traverse(object=>{
 if(object.name.startsWith('Empty_card_slot'))slots++;
 if(!object.isMesh)return;
 if(Array.isArray(object.material))throw Error('Unexpected multi-material mesh');
 const group=batches.get(object.material)||[];
 group.push(object.geometry.clone().applyMatrix4(object.matrixWorld));batches.set(object.material,group);
});
const round=x=>Math.round(x*1e5)/1e5;
const meshes=[...batches].map(([material,geometries])=>{
 const geometry=mergeGeometries(geometries,false);if(!geometry)throw Error('Cannot merge arena material');
 const positions=Array.from(geometry.attributes.position.array,round);
 const normals=Array.from(geometry.attributes.normal.array,round);
 // glTF is right handed; Unity is left handed. Reflect Z and reverse triangle winding.
 for(let i=2;i<positions.length;i+=3){positions[i]=-positions[i];normals[i]=-normals[i];}
 const triangles=Array.from(geometry.index.array);
 for(let i=0;i<triangles.length;i+=3)[triangles[i+1],triangles[i+2]]=[triangles[i+2],triangles[i+1]];
 return {name:material.name,positions,normals,triangles,color:[...material.color.toArray(),material.opacity],emission:(material.emissive?.clone().multiplyScalar(material.emissiveIntensity??1).toArray()||[0,0,0]),metallic:material.metalness,roughness:material.roughness,doubleSided:material.side===THREE.DoubleSide};
});
// Reflect the world across Z, including camera/light rotations. A glTF camera
// looks along -Z; Unity cameras look along +Z, so C * R * C preserves its view.
function pose(object){
 const p=object.getWorldPosition(new THREE.Vector3()),q=object.getWorldQuaternion(new THREE.Quaternion());
 return {position:[p.x,p.y,-p.z].map(round),rotation:[-q.x,-q.y,q.z,q.w].map(round)};
}
const camera=gltf.cameras[0];if(!camera?.isOrthographicCamera)throw Error('Expected the original orthographic arena camera');
const lights=[];
gltf.scene.traverse(object=>{
 if(!object.isLight)return;
 if(!object.isPointLight&&!object.isDirectionalLight)throw Error('Unsupported source light: '+object.type);
 lights.push({name:object.name,...pose(object),type:object.isDirectionalLight?'directional':'point',color:object.color.toArray(),intensity:object.intensity,range:object.distance||0,shadows:!!(object.isDirectionalLight&&object.userData.hf_cast_shadow===true)});
});
const result={sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),slots,meshes,camera:{name:camera.name,...pose(camera),halfHeight:camera.top,halfWidth:camera.right,near:camera.near,far:camera.far},lights};
if(slots!==10||meshes.length>16)throw Error('Arena budget or slot count violated');
const output='Unity/Assets/Resources/Elemental/Arena/arena.json';
fs.mkdirSync('Unity/Assets/Resources/Elemental/Arena',{recursive:true});
fs.writeFileSync(output,JSON.stringify(result)+'\n');
console.log(`${output}: ${meshes.length} batches, ${slots} slots, ${meshes.reduce((s,m)=>s+m.triangles.length/3,0)} triangles`);
