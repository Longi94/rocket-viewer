import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVersion } from '../replay-header';

export const AttributeTypeGameMode: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): number => {
    if (version.engine >= 868 && version.licensee >= 12) {
      return br.readByte();
    } else {
      return br.readUInt32Max(4);
    }
  }
};
