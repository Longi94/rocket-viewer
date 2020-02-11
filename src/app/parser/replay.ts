import { BinaryReader } from './binary-reader';
import { Replay } from './model/replay';

export class ReplayParser {
  private br: BinaryReader;

  parse(buffer: ArrayBuffer): Replay {
    this.br = new BinaryReader(buffer);
    return Replay.deserialize(this.br);
  }
}

