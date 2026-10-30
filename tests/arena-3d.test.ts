import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Mesh, type Material, type BufferGeometry } from 'three';

test('committed arena loads offline with ten slots, camera, decks and bounded geometry', async () => {
  const bytes = readFileSync('public/assets/arena/elemental-arena.glb');
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const nodes: string[] = [];
  const groups = new Map<Material, BufferGeometry[]>();
  let triangles = 0;
  gltf.scene.traverse(object => {
    nodes.push(object.name);
    if (!(object instanceof Mesh)) return;
    assert.ok(!Array.isArray(object.material), 'static batching expects one material per mesh');
    const batch = groups.get(object.material) || [];
    batch.push(object.geometry.clone().applyMatrix4(object.matrixWorld));
    groups.set(object.material, batch);
    triangles += object.geometry.index!.count / 3;
  });
  assert.equal(nodes.filter(name => name.startsWith('Empty_card_slot')).length, 10);
  assert.equal(nodes.filter(name => name.startsWith('Deck_stack')).length, 2);
  assert.equal(gltf.cameras.length, 1);
  assert.ok(triangles < 60000);
  assert.ok(groups.size <= 16, 'iPhone scenery stays within 16 material batches');
  groups.forEach(batch => {
    const merged = mergeGeometries(batch, false);
    assert.ok(merged, 'every material batch merges successfully');
    merged.dispose(); batch.forEach(geometry => geometry.dispose());
  });
});
