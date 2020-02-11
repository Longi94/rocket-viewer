import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { ReplayVersion } from '../replay-header';

export enum UniqueIdType {
  UNKNOWN = 0, STEAM = 1, PS4 = 2, PS3 = 3, XBOX = 4, SWITCH = 6, PSYNET = 7
}

export class UniqueId {
  type: UniqueIdType;
  id: Uint8Array;
  playerNumber: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): UniqueId {
    const type = br.readByte() as UniqueIdType;

    const uid = new UniqueId();
    uid.type = type;

    switch (type) {
      case UniqueIdType.UNKNOWN:
        if (version.licensee >= 18 && version.net == 0) {
          return uid;
        } else {
          uid.id = br.readBytes(3); // Will be 0
          if (uid.id.some(value => value) && (version.licensee < 18 || version.net > 0)) {
            throw new Error('Unknown id isn\'t 0, might be lost');
          }
        }
        break;
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

export const AttributeTypeUniqueId: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): UniqueId => {
    return UniqueId.deserialize(br, version);
  }
};
