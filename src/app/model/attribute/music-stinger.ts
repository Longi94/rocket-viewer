import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export class MusicStinger {
  flag: boolean;
  cue: number;
  trigger: number;

  static deserialize(br: BinaryReader): MusicStinger {
    const m = new MusicStinger();
    m.flag = br.readBool();
    m.cue = br.readUInt32();
    m.trigger = br.readByte();
    return m;
  }
}

export const AttributeTypeMusicStinger: AttributeType = {
  deserialize: (br: BinaryReader): MusicStinger => {
    return MusicStinger.deserialize(br);
  }
};
