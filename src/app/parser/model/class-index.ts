import { BinaryReader } from '../binary-reader';

export class ClassIndex {
  class: string;
  index: number;

  static deserialize(br: BinaryReader): ClassIndex {
    const cm = new ClassIndex();
    cm.class = br.readString();
    cm.index = br.readInt32();
    return cm;
  }
}
