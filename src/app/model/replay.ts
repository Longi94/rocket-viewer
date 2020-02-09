import { ReplayHeader } from './replay-header';
import { BinaryReader } from '../parser/binary-reader';


export class Replay {
  header: ReplayHeader;

  propertyLength: number;
  propertyCrc: number;

  static deserialize(br: BinaryReader) {
    const replay = new Replay();
    replay.header = ReplayHeader.deserialize(br);
    return replay;
  }
}
