import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeFlaggedByte: AttributeType = {
  deserialize: (br: BinaryReader) => {
    return {
      flag: br.readBool(),
      byte: br.readByte()
    };
  }
};
