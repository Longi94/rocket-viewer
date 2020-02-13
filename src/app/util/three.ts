import { Texture } from 'three';

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
