import { BinaryReader } from '../parser/binary-reader';

export class Rotation {
  pitch: number = 0;
  yaw: number = 0;
  roll: number = 0;

  static deserialize(br: BinaryReader): Rotation {
    const r = new Rotation()

    if (br.readBit()) {
      r.pitch = br.readByte();
    }
    if (br.readBit()) {
      r.yaw = br.readByte();
    }
    if (br.readBit()) {
      r.roll = br.readByte();
    }

    return r;
  }
}
