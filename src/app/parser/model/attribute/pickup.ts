import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export class Pickup {
  instigatorId: number;
  pickedUp: boolean;

  static deserialize(br: BinaryReader): Pickup {
    const instigator = br.readBool();
    const p = new Pickup();

    if (instigator) {
      p.instigatorId = br.readInt32();
    }

    p.pickedUp = br.readBool();
    return p;
  }
}

export const AttributeTypePickup: AttributeType = {
  deserialize: (br: BinaryReader): Pickup => {
    return Pickup.deserialize(br);
  }
};
