import { BinaryReader } from '../parser/binary-reader';

export class TickMark {
  type: string;
  frame: number;

  static deserialize(br: BinaryReader): TickMark {
    const t = new TickMark();
    t.type = br.readString();
    t.frame = br.readInt32();
    return t;
  }
}
