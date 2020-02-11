import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeString: AttributeType = {
  deserialize: (br: BinaryReader): string => {
    return br.readString();
  }
};
