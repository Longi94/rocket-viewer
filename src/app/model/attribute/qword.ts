import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export const AttributeTypeQWord: AttributeType = {
  deserialize: (br: BinaryReader): Uint8Array => {
    return br.readBytes(8);
  }
};
