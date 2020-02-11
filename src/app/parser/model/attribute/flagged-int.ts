import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeFlaggedInt: AttributeType = {
  deserialize: (br: BinaryReader) => {
    return {
      flag: br.readBool(),
      int: br.readInt32()
    };
  }
};
