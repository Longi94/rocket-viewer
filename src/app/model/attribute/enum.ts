import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeEnum: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readUInt32FromBits(11);
  }
};
