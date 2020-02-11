import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayVersion } from '../replay-header';

export class Explosion {
  unknown1: boolean;
  actorId: number;
  position: ReplayVector;

  static deserialize(br: BinaryReader, version: ReplayVersion) {
    const e = new Explosion();
    e.unknown1 = br.readBool();
    e.actorId = br.readUInt32();
    e.position = ReplayVector.deserialize(br, version);
    return e;
  }
}

export const AttributeTypeExplosion: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion) => {
    return Explosion.deserialize(br, version);
  }
};
