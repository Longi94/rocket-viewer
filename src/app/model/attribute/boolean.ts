import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeBoolean: AttributeType = {
  deserialize: (br: BinaryReader): boolean => {
    return br.readBool();
  }
};
