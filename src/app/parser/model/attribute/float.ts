import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export const AttributeTypeFloat: AttributeType = {
  deserialize: (br: BinaryReader): number => {
    return br.readFloat32();
  }
};
