import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayVersion } from '../replay-header';

export class AppliedDamage {
  unknown1: number;
  position: ReplayVector;
  unknown3: number;
  unknown4: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): AppliedDamage {
    const d = new AppliedDamage();

    d.unknown1 = br.readByte();
    d.position = ReplayVector.deserialize(br, version);
    d.unknown3 = br.readInt32();
    d.unknown4 = br.readInt32();

    return d;
  }
}

export const AttributeTypeAppliedDamage: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): AppliedDamage => {
    return AppliedDamage.deserialize(br, version);
  }
};
