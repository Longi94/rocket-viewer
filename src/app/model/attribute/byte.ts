import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeByte: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readByte();
  }
};
