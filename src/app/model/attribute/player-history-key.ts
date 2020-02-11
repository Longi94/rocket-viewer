import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypePlayerHistoryKey: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readUInt32FromBits(14);
  }
};
