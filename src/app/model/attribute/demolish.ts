import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayVersion } from '../replay-header';

export class Demolish {
  attackerFlag: boolean;
  attackerActorId: number;
  victimFlag: boolean;
  victimActorId: number;
  attackerVelocity: ReplayVector;
  victimVelocity: ReplayVector;

  static deserialize(br: BinaryReader, version: ReplayVersion): Demolish {
    const d = new Demolish();
    d.attackerFlag = br.readBool();
    d.attackerActorId = br.readInt32();
    d.victimFlag = br.readBool();
    d.victimActorId = br.readInt32();
    d.attackerVelocity = ReplayVector.deserialize(br, version);
    d.victimVelocity = ReplayVector.deserialize(br, version);
    return d;
  }
}

export const AttributeTypeDemolish: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): Demolish => {
    return Demolish.deserialize(br, version);
  }
};
