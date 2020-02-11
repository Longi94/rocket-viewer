import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeInt64: AttributeType = {
  deserialize: (br: BinaryReader): bigint => {
    return br.readUInt64();
  }
};
