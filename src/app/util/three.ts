import { Euler, Quaternion, Texture, Vector3 } from 'three';
import { Position } from '../model/replay/location';
import { Quaternion as ReplayQuaternion } from '../model/replay/rotation';

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

export function setFromReplayPosition(v: Vector3, p: Position) {
  v.x = p.x;
  v.y = p.z;
  v.z = p.y;
}

export function setFromQuaternion(e: Euler, q: ReplayQuaternion) {
  const quat = new Quaternion(q.x, q.y, q.z, q.w);
  e.setFromQuaternion(quat);
}
