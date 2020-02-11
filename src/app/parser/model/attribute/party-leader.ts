import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { UniqueId, UniqueIdType } from './unique-id';
import { ReplayVersion } from '../replay-header';

export class PartyLeader {

  type: UniqueIdType;
  id: Uint8Array;
  playerNumber: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): UniqueId {
    const type = br.readByte() as UniqueIdType;

    const uid = new UniqueId();
    uid.type = type;

    switch (type) {
      case UniqueIdType.UNKNOWN:
        return uid;
      case UniqueIdType.XBOX:
      case UniqueIdType.STEAM:
        uid.id = br.readBytes(8);
        break;
      case UniqueIdType.PS4:
        if (version.net >= 1) {
          uid.id = br.readBytes(40);
        } else {
          uid.id = br.readBytes(32);
        }
        break;
      case UniqueIdType.SWITCH:
        uid.id = br.readBytes(32);
        break;
      case UniqueIdType.PSYNET:
        if (version.net >= 10) {
          uid.id = br.readBytes(8);
        } else {
          uid.id = br.readBytes(32);
        }
        break;
      default:
        throw Error(`Unknown unique id type ${type}`);
    }

    uid.playerNumber = br.readByte();

    return uid;
  }
}

export const AttributeTypePartyLeader: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): UniqueId => {
    return PartyLeader.deserialize(br, version);
  }
};
