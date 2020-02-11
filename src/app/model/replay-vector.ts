import { BinaryReader } from '../parser/binary-reader';
import { ReplayVersion } from './replay-header';

export class ReplayVector {

  numBits: number;
  dX: number;
  dY: number;
  dZ: number;
  x: number;
  y: number;
  z: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): ReplayVector {
    const size = version.ge(868, 22, 7) ? 22 : 20;

    const p = new ReplayVector();

    p.numBits = br.readUInt32Max(size);

    const bias = 1 << (p.numBits + 1);
    const max = p.numBits + 2;

    p.dX = br.readUInt32FromBits(max);
    p.dY = br.readUInt32FromBits(max);
    p.dZ = br.readUInt32FromBits(max);

    p.x = p.dX - bias;
    p.y = p.dY - bias;
    p.z = p.dZ - bias;

    return p;
  }

  static deserializeFixed(br: BinaryReader): ReplayVector {
    const p = new ReplayVector();

    return p;
  }
}
