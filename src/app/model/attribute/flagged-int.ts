import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeFlaggedInt: AttributeType = {
  deserialize: (br: BinaryReader) => {
    return {
      flag: br.readBool(),
      int: br.readInt32()
    };
  }
};
