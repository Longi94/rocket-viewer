import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { UniqueId, UniqueIdType } from './unique-id';
import { ReplayVersion } from '../replay-header';

export class Reservation {
  playerId: UniqueId;
  playerName: string;

  static deserialize(br: BinaryReader, version: ReplayVersion): Reservation {
    const r = new Reservation();

    // unknown
    br.skipBits(3);

    r.playerId = UniqueId.deserialize(br, version);

    if (r.playerId.type !== UniqueIdType.UNKNOWN) {
      r.playerName = br.readString();
    }

    if (version.engine < 868 || version.licensee < 12) {
      br.skipBits(2);
    } else {
      br.skipBits(8);
    }

    return r;
  }
}

export const AttributeTypeReservation: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): Reservation => {
    return Reservation.deserialize(br, version);
  }
};
