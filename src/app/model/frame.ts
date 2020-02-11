import { Cache } from './cache';
import { ActorState, Replication } from './replication';
import { BinaryReader } from '../parser/binary-reader';
import { ReplayVersion } from './replay-header';

export class Frame {

  time: number;
  delta: number;
  replications: Replication[];

  static deserialize(maxChannels: number, existingReplications: { [key: number]: Replication },
                     objectIdToName: string[], caches: { [key: string]: Cache }, version: ReplayVersion,
                     br: BinaryReader): Frame {
    const f = new Frame();

    f.time = br.readFloat32();
    f.delta = br.readFloat32();

    if (f.time < 0 || f.delta < 0) {
      throw new Error(`Frame time values are negative`);
    }

    f.replications = [];

    while (br.readBit()) {
      const r = Replication.deserialize(maxChannels, existingReplications, f.replications, objectIdToName, caches,
        version, br);

      if (r.actorState !== ActorState.DELETED) {
        if (!(r.actorId in existingReplications)) {
          existingReplications[r.actorId] = r;
        }
      } else {
        delete existingReplications[r.actorId];
      }

      f.replications.push(r);
    }

    return f;
  }

  static extractFrames(maxChannels: number, networkStream: ArrayBuffer, objectIdToName: string[],
                       caches: Cache[], version: ReplayVersion): Frame[] {
    const frames: Frame[] = [];

    const replications: { [key: number]: Replication } = {};
    const streamReader = new BinaryReader(networkStream);

    const cacheDict: { [key: string]: Cache } = {};
    for (const cache of caches) {
      cacheDict[objectIdToName[cache.objectIndex]] = cache;
    }

    while (streamReader.bitPos < streamReader.length() * 8) {
      const f = Frame.deserialize(maxChannels, replications, objectIdToName, cacheDict, version, streamReader);

      if (frames.length > 0 && f.time != 0 && frames[frames.length - 1].time > f.time) {
        throw new Error('Frame time is less than the previous frame\'s time.');
      }

      frames.push(f);
    }

    return frames;
  }
}
