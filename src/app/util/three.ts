import { Object3D, Texture } from 'three';
import { traverseMaterials } from 'rl-loadout-lib/dist/3d/object';
import { TextureEncoding } from 'three/src/constants';

export function applyEnvMap(o, envMap: Texture) {
  o.traverse(object => {
    if (!object.isMesh) {
      return;
    }
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const mat of materials) {
      if (mat.isMeshStandardMaterial) {
        mat.envMap = envMap;
      }
    }
  });
}

export function setEncoding(o: Object3D, encoding: TextureEncoding) {
  traverseMaterials(o, material => {
    if (material.map) {
      material.map.encoding = encoding;
    }
    if (material.emissiveMap) {
      material.emissiveMap.encoding = encoding;
    }
    if (material.map || material.emissiveMap) {
      material.needsUpdate = true;
    }
  });
}

export function clearObject3D(object) {
  for (const child of object.children) {
    if (object.isLight) {
      continue;
    }
    disposeObject(child);
    clearObject3D(child);
    object.remove(child);
  }
}

export function disposeObject(object) {
  object.material?.dispose();
  object.geometry?.dispose();
}
