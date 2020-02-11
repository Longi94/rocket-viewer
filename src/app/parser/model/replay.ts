import { ReplayHeader } from './replay-header';
import { BinaryReader } from '../binary-reader';
import { ReplayBody } from './replay-body';


export class Replay {
  header: ReplayHeader;
  body: ReplayBody;

  static deserialize(br: BinaryReader) {
    const replay = new Replay();
    replay.header = ReplayHeader.deserialize(br);
    replay.body = ReplayBody.deserialize(br, replay.header);
    return replay;
  }
}
