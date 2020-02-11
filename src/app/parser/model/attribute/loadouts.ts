import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { Loadout } from './loadout';

export class Loadouts {
  loadout1: Loadout;
  loadout2: Loadout;

  static deserialize(br: BinaryReader): Loadouts {
    const l = new Loadouts();
    l.loadout1 = Loadout.deserialize(br);
    l.loadout2 = Loadout.deserialize(br);
    return l;
  }
}

export const AttributeTypeLoadouts: AttributeType = {
  deserialize: (br: BinaryReader): Loadouts => {
    return Loadouts.deserialize(br);
  }
};
