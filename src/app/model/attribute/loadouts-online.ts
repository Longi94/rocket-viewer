import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { LoadoutOnline } from './loadout-online';
import { ReplayVersion } from '../replay-header';

export class LoadoutsOnline {
  loadoutOnline1: LoadoutOnline;
  loadoutOnline2: LoadoutOnline;
  unknown1: boolean;
  unknown2: boolean;

  static deserialize(br: BinaryReader, version: ReplayVersion, objectNames: string[]): LoadoutsOnline {
    const l = new LoadoutsOnline();
    l.loadoutOnline1 = LoadoutOnline.deserialize(br, version, objectNames);
    l.loadoutOnline2 = LoadoutOnline.deserialize(br, version, objectNames);

    if (l.loadoutOnline1.attributes.length !== l.loadoutOnline2.attributes.length) {
      throw new Error('ClientLoadoutOnline list counts must match');
    }

    l.unknown1 = br.readBool();
    l.unknown2 = br.readBool();

    return l;
  }
}

export const AttributeTypeLoadoutsOnline: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion, objectNames: string[]): LoadoutsOnline => {
    return LoadoutsOnline.deserialize(br, version, objectNames);
  }
};
