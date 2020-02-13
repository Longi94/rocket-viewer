import { Euler, Vector3 } from 'three';
import { Rotation } from '../model/replay/rotation';
import { Location } from '../model/replay/location';

export function rotationToEuler(r: Rotation): Euler {
  const e = new Euler();
  if (r == undefined) {
    return e;
  }
  e.x = (r.yaw ?? 0) / 180;
  e.y = (r.pitch ?? 0) / 180;
  e.z = (r.roll ?? 0) / 180;
  return e;
}

export function locationToVector3(l: Location): Vector3 {
  const v = new Vector3();
  if (l == undefined) {
    return v;
  }
  const bias = l.bias ?? 0;
  v.x = (l.dx ?? 0) - bias;
  v.y = (l.dz ?? 0) - bias;
  v.z = (l.dy ?? 0) - bias;
  return v;
}

export function copyFromLocation(v: Vector3, l: Location, netVersion: number) {
  if (l == undefined) {
    return;
  }
  const bias = l.bias ?? 0;
  v.x = (l.dx ?? 0) - bias;
  v.y = (l.dz ?? 0) - bias;
  v.z = (l.dy ?? 0) - bias;
  if (netVersion >= 7) {
    v.x /= 100;
    v.y /= 100;
    v.z /= 100;
  }
}

export function copyFromRotation(e: Euler, r: Rotation) {
  if (r == undefined) {
    return e;
  }
  e.x = (r.yaw ?? 0) / 180;
  e.y = (r.pitch ?? 0) / 180;
  e.z = (r.roll ?? 0) / 180;
}

export function interpolateLocation(v: Vector3, l1: Location, l2: Location, p: number, netVersion: number) {
  const bias1 = l1.bias ?? 0;
  const bias2 = l2.bias ?? 0;

  v.x = interpolateValue(l1.dx - bias1, l2.dx - bias2, p);
  v.y = interpolateValue(l1.dz - bias1, l2.dz - bias2, p);
  v.z = interpolateValue(l1.dy - bias1, l2.dy - bias2, p);

  if (netVersion >= 7) {
    v.x /= 100;
    v.y /= 100;
    v.z /= 100;
  }
}

function interpolateValue(a, b, p) {
  return a + p * (b - a);
}
