// Draw-call batching for the procedural transformer.
//
// The model is built from ~165 small meshes, each drawn twice per frame (main
// pass + shadow pass): ~330 draw calls per scene, ~7–10 ms of main-thread
// JavaScript per frame on an integrated-GPU laptop. Most of those meshes never
// move relative to their neighbours and share a material (20 core boxes, 7
// porcelain bushings, 8 skid beams, ...).
//
// This pass merges, inside each rigidly-moving part, all meshes that share a
// material into a single mesh. Vertices are baked with their exact relative
// transforms, and normals, UVs, materials and shadow flags are unchanged, so the
// rendered image is the same; only the number of draw calls drops. Every
// animated group (walls, radiator banks, fans, cover, top yoke, windings, HV
// coils) keeps its own transform and is batched separately, so all motion is
// unchanged.
//
// Not batched:
//  - tank walls: they turn semi-transparent in the anatomy, and merging would
//    change the blend order of overlapping transparent faces;
//  - InstancedMesh (radiator fins, cover bolts): already one draw each;
//  - meshes whose material is unique (e.g. per-winding copper).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Merge same-material meshes under `root`, not descending into `exclude`. */
export function batchRigid(root: THREE.Object3D, exclude: Iterable<THREE.Object3D>) {
  const skip = new Set(exclude);
  const byMaterial = new Map<THREE.Material, THREE.Mesh[]>();
  const walk = (o: THREE.Object3D) => {
    for (const c of o.children) {
      if (skip.has(c)) continue;
      const m = c as THREE.Mesh;
      if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(m.material)) {
        const list = byMaterial.get(m.material) ?? [];
        list.push(m);
        byMaterial.set(m.material, list);
      }
      walk(c);
    }
  };
  walk(root);

  root.updateWorldMatrix(true, true);
  const toRoot = root.matrixWorld.clone().invert();
  const rel = new THREE.Matrix4();
  const removed: THREE.BufferGeometry[] = [];

  for (const [material, meshes] of byMaterial) {
    if (meshes.length < 2) continue;
    const cast = meshes[0].castShadow, receive = meshes[0].receiveShadow;
    if (meshes.some(m => m.castShadow !== cast || m.receiveShadow !== receive)) continue;
    const geos = meshes.map(m => m.geometry.clone().applyMatrix4(rel.multiplyMatrices(toRoot, m.matrixWorld)));
    const merged = mergeGeometries(geos, false);
    geos.forEach(g => g.dispose());
    if (!merged) continue; // incompatible attributes: leave these meshes as they were
    const batch = new THREE.Mesh(merged, material);
    batch.castShadow = cast;
    batch.receiveShadow = receive;
    batch.name = 'batch';
    root.add(batch);
    for (const m of meshes) {
      m.removeFromParent();
      removed.push(m.geometry);
    }
  }
  return removed;
}

/** Dispose geometries that no mesh under `model` still uses (some are shared, e.g. cloned rims). */
export function disposeUnused(model: THREE.Object3D, candidates: THREE.BufferGeometry[]) {
  const inUse = new Set<THREE.BufferGeometry>();
  model.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) inUse.add(m.geometry); });
  new Set(candidates).forEach(g => { if (!inUse.has(g)) g.dispose(); });
}
