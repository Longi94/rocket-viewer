import { BinaryReader } from '../../parser/binary-reader';
import { AttributeType } from './attribute';

export class Title {
  unknown1: boolean;
  unknown2: boolean;
  unknown3: number;
  unknown4: number;
  unknown5: number;
  unknown6: number;
  unknown7: number;
  unknown8: boolean;

  static deserialize(br: BinaryReader): Title {
    const t = new Title();
    t.unknown1 = br.readBool();
    t.unknown2 = br.readBool();
    t.unknown3 = br.readUInt32();
    t.unknown4 = br.readUInt32();
    t.unknown5 = br.readUInt32();
    t.unknown6 = br.readUInt32();
    t.unknown7 = br.readUInt32();
    t.unknown8 = br.readBool();
    return t;
  }
}

export const AttributeTypeTitle: AttributeType = {
  deserialize: (br: BinaryReader): Title => {
    return Title.deserialize(br);
  }
};
