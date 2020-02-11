import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayVersion } from '../replay-header';

export class DamageState {
  damageState: number;
  isDamaged: boolean;
  playerActorId: number;
  ballPosition: ReplayVector;
  isHit: boolean;
  unknown6: boolean;

  static deserialize(br: BinaryReader, version: ReplayVersion): DamageState {
    const d = new DamageState();
    d.damageState = br.readByte();
    d.isDamaged = br.readBool();
    d.playerActorId = br.readUInt32();
    d.ballPosition = ReplayVector.deserialize(br, version);
    d.isHit = br.readBool();
    d.unknown6 = br.readBool();
    return d;
  }
}

export const AttributeTypeDamageState: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): DamageState => {
    return DamageState.deserialize(br, version);
  }
};
