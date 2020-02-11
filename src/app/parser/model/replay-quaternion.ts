import { BinaryReader } from '../binary-reader';
import { ReplayVersion } from './replay-header';

export class ReplayQuaternion {

  x: number;
  y: number;
  z: number;
  w: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): ReplayQuaternion {
    const q = new ReplayQuaternion();
    if (version.ge(868, 22, 7)) {
      const largestComponent = br.readInt32FromBits(2);

      const a = uncompressComponent(br.readInt32FromBits(18));
      const b = uncompressComponent(br.readInt32FromBits(18));
      const c = uncompressComponent(br.readInt32FromBits(18));
      const missing = Math.sqrt(1.0 - (a * a) - (b * b) - (c * c));

      switch (largestComponent) {
        case 0:
          q.x = missing;
          q.y = a;
          q.z = b;
          q.w = c;
          break;
        case 1:
          q.x = a;
          q.y = missing;
          q.z = b;
          q.w = c;
          break;
        case 2:
          q.x = a;
          q.y = b;
          q.z = missing;
          q.w = c;
          break;
        default:
          q.x = a;
          q.y = b;
          q.z = c;
          q.w = missing;
          break;
      }
    } else {
      q.x = br.readFixedCompressedFloat(1, 16);
      q.y = br.readFixedCompressedFloat(1, 16);
      q.z = br.readFixedCompressedFloat(1, 16);
    }
    return q;
  }
}

function uncompressComponent(val: number) {
  const maxValue = (1 << 16) - 1;
  const positiveRangedValue = val / maxValue;
  const rangedValue = (positiveRangedValue - 0.5) * 2.0;
  return rangedValue * (1 / Math.sqrt(2));
}
