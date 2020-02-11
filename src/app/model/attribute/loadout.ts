import { BinaryReader } from '../../parser/binary-reader';
import { AttributeType } from './attribute';

export class Loadout {
  version: number;

  body: number;
  decal: number;
  wheels: number;
  boost: number;
  antenna: number;
  topper: number;
  unknown1: number;
  unknown2: number;
  engineAudio: number;
  trail: number;
  goalExplosion: number;
  banner: number;
  unknown3: number;
  unknown4: number;
  unknown5: number;
  unknown6: number;

  static deserialize(br: BinaryReader): Loadout {
    const l = new Loadout();
    l.version = br.readByte();
    l.body = br.readUInt32();
    l.decal = br.readUInt32();
    l.wheels = br.readUInt32();
    l.boost = br.readUInt32();
    l.antenna = br.readUInt32();
    l.topper = br.readUInt32();
    l.unknown1 = br.readUInt32();

    if (l.version > 10) {
      l.unknown2 = br.readUInt32();
    }

    if (l.version > 16) {
      l.engineAudio = br.readUInt32();
      l.trail = br.readUInt32();
      l.goalExplosion = br.readUInt32();
    }
    if (l.version > 17) {
      l.banner = br.readUInt32();
    }
    if (l.version > 19) {
      l.unknown3 = br.readUInt32();
    }
    if (l.version > 22) {
      l.unknown4 = br.readUInt32();
      l.unknown5 = br.readUInt32();
      l.unknown6 = br.readUInt32();
    }

    return l;
  }
}

export const AttributeTypeLoadout: AttributeType = {
  deserialize: (br: BinaryReader): Loadout => {
    return Loadout.deserialize(br);
  }
};
