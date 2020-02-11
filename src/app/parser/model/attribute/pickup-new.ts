import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export class PickupNew {
  instigatorId: number;
  pickedUp: number;

  static deserialize(br: BinaryReader): PickupNew {
    const instigator = br.readBool();
    const p = new PickupNew();

    if (instigator) {
      p.instigatorId = br.readInt32();
    }

    p.pickedUp = br.readByte();
    return p;
  }
}

export const AttributeTypePickupNew: AttributeType = {
  deserialize: (br: BinaryReader): PickupNew => {
    return PickupNew.deserialize(br);
  }
};

