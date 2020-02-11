import { BinaryReader } from '../binary-reader';

export class ClassMapping {
  class: string;
  index: number;

  static deserialize(br: BinaryReader): ClassMapping {
    const cm = new ClassMapping();
    cm.class = br.readString();
    cm.index = br.readInt32();
    return cm;
  }
}
