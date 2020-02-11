import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVersion } from '../replay-header';

export interface AttributeType {
  deserialize: (br: BinaryReader, version: ReplayVersion, objectNames: string[]) => any;
}
