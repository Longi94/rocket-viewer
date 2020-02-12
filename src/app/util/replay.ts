import { Euler, Vector3 } from 'three';
import { Rotation } from '../model/replay/rotation';
import { Location } from '../model/replay/location';

export function rotationToEuler(r: Rotation): Euler {
  const e = new Euler();
  if (r == undefined) {
    return e;
  }
  if (r.yaw != undefined) {
    e.x = r.yaw / 180;
  }
  if (r.pitch != undefined) {
    e.y = r.pitch / 180;
  }
  if (r.roll != undefined) {
    e.z = r.roll / 180;
  }
  return e;
}

export function locationToVector3(l: Location): Vector3 {
  const v = new Vector3();
  if (l == undefined) {
    return v;
  }
  const bias = l.bias == undefined ? 0 : l.bias;
  if (l.dx != undefined) {
    v.x = l.dx - bias;
  }
  if (l.dy != undefined) {
    v.y = l.dy - bias;
  }
  if (l.dz != undefined) {
    v.z = l.dz - bias;
  }
  return v;
}
