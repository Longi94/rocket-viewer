import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeByte: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readByte();
  }
};
