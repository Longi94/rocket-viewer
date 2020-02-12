import { CacheInfo, NetCache } from './net-cache';
import { ActorState, Replication } from './replication';
import { BinaryReader } from '../binary-reader';
import { ReplayVersion } from './replay-header';

export class Frame {

  time: number;
  delta: number;
  replications: Replication[];

  static deserialize(maxChannels: number, existingReplications: { [p: number]: Replication },
                     br: BinaryReader, objectIndAttrs: { [p: string]: CacheInfo }, version: ReplayVersion,
                     isLan: boolean, objectIdToName: string[]): Frame {
    const f = new Frame();

    f.time = br.readFloat32();

    if (f.time < 0 || (f.time > 0 && f.time < 1e-10)) {
      throw new Error(`Frame time values are invalid`);
    }

    f.delta = br.readFloat32();

    if (f.delta < 0 || (f.delta > 0 && f.delta < 1e-10)) {
      throw new Error(`Frame time values are invalid`);
    }

    if (f.time === 0 && f.delta === 0) {
      // TODO end frame
      return undefined;
    }

    f.replications = [];

    while (br.readBit()) {
      const r = Replication.deserialize(maxChannels, existingReplications, br, objectIndAttrs, version, isLan,
        objectIdToName);

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
}
