import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeString: AttributeType = {
  deserialize: (br: BinaryReader): string => {
    return br.readString();
  }
};
