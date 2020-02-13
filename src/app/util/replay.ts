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
  if (l.dz != undefined) {
    v.y = l.dz - bias;
  }
  if (l.dy != undefined) {
    v.z = l.dy - bias;
  }
  return v;
}

export function copyFromLocation(v: Vector3, l: Location, netVersion: number) {
  if (l == undefined) {
    return;
  }
  const bias = l.bias == undefined ? 0 : l.bias;
  if (l.dx != undefined) {
    v.x = l.dx - bias;
  } else {
    v.x = 0;
  }
  if (l.dz != undefined) {
    v.y = l.dz - bias;
  } else {
    v.y = 0;
  }
  if (l.dy != undefined) {
    v.z = l.dy - bias;
  } else {
    v.z = 0;
  }
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
  if (r.yaw != undefined) {
    e.x = r.yaw / 180;
  } else {
    e.x = 0;
  }
  if (r.pitch != undefined) {
    e.y = r.pitch / 180;
  } else {
    e.y = 0;
  }
  if (r.roll != undefined) {
    e.z = r.roll / 180;
  } else {
    e.z = 0;
  }
}

export function interpolateLocation(v: Vector3, l1: Location, l2: Location, p: number, netVersion: number) {
  const bias1 = l1.bias == undefined ? 0 : l1.bias;
  const bias2 = l2.bias == undefined ? 0 : l2.bias;

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
