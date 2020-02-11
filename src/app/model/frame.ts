import { Cache } from './cache';
import { Replication } from './replication';
import { BinaryReader } from '../parser/binary-reader';
import { max } from 'rxjs/operators';
import { CacheEntry } from '@angular-devkit/build-angular/src/utils/action-cache';
import { ReplayVersion } from './replay-header';

export class Frame {

  time: number;
  delta: number;
  replications: Replication[];

  static deserialize(maxChannels: number, existingReplications: { [key: number]: Replication },
                     objectIdToName: string[], caches: { [key: number]: Cache }, version: ReplayVersion,
                     br: BinaryReader): Frame {
    const f = new Frame();

    f.time = br.readFloat32();
    f.delta = br.readFloat32();

    if (f.time < 0 || f.delta < 0) {
      throw new Error(`Frame time values are negative`);
    }

    let lastReplication: Replication;
    while (br.readBit()) {
      const r = Replication.deserialize(maxChannels, existingReplications, f.replications, objectIdToName, caches,
        version, br);
    }

    return f;
  }

  static extractFrames(maxChannels: number, networkStream: ArrayBuffer, objectIdToName: string[],
                       caches: Cache[], version: ReplayVersion, br: BinaryReader): Frame[] {
    const frames: Frame[] = [];

    const replications: { [key: number]: Replication } = {};
    const streamReader = new BinaryReader(networkStream);

    const cacheDict: { [key: number]: Cache } = {};
    for (const cache of caches) {
      cacheDict[cache.objectIndex] = cache;
    }

    while (br.bitPos < br.length() * 8) {
      const f = Frame.deserialize(maxChannels, replications, objectIdToName, cacheDict, version, streamReader);

      if (frames.length > 0 && f.time != 0 && frames[frames.length - 1].time > f.time) {
        throw new Error('Frame time is less than the previous frame\'s time.');
      }

      frames.push(f);
    }

    return frames;
  }
}
