import { BinaryReader } from '../parser/binary-reader';

export class KeyFrame {
  time: number;
  frame: number;
  framePosition: number;

  static deserialize(br: BinaryReader): KeyFrame {
    const k = new KeyFrame();
    k.time = br.readFloat32();
    k.frame = br.readInt32();
    k.framePosition = br.readInt32();
    return k;
  }
}
