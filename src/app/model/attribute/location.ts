import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayVersion } from '../replay-header';

export const AttributeTypeLocation: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): ReplayVector => {
    return ReplayVector.deserialize(br, version.net);
  }
};
