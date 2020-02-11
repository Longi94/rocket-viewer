import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { Explosion } from './explosion';
import { ReplayVersion } from '../replay-header';

export class ExtendedExplosion extends Explosion {
  unknown3: boolean;
  unknown4: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): ExtendedExplosion {
    const e = Explosion.deserialize(br, version) as ExtendedExplosion;

    e.unknown3 = br.readBool();
    e.unknown4 = br.readUInt32();

    return e;
  }
}

export const AttributeTypeExtendedExplosion: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): ExtendedExplosion => {
    return ExtendedExplosion.deserialize(br, version);
  }
};
