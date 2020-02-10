import { Cache } from './cache';
import { Replication } from './replication';
import { BinaryReader } from '../parser/binary-reader';

export class Frame {

  time: number;
  delta: number;
  replications: Replication[];

  static deserialize(br: BinaryReader) {
    const f = new Frame();

    f.time = br.readFloat32();
    f.delta = br.readFloat32();

    if (f.time < 0 || f.delta < 0) {
      throw new Error(`Frame time values are negative`);
    }
  }

  static extractFrames(maxChannels: number, networkStream: ArrayBuffer, objectIdToName: string[],
                       caches: Cache[], engineVersion: number, licenseeVersion: number, netVersion: number): Frame[] {
    const frames: Frame[] = [];

    return frames;
  }
}
