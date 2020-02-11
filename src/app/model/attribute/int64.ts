import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeInt64: AttributeType = {
  deserialize: (br: BinaryReader): bigint => {
    return br.readUInt64();
  }
};
