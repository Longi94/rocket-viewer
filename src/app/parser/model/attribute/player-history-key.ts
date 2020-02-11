import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypePlayerHistoryKey: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readUInt32FromBits(14);
  }
};
