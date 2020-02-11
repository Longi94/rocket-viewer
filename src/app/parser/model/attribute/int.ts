import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeInt: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readUInt32();
  }
};
