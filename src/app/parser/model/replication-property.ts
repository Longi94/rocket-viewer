import { BinaryReader } from '../binary-reader';
import { CacheInfo } from './net-cache';
import { ReplayVersion } from './replay-header';

export class ReplicationProperty {
  id: number;
  data: any;

  name: string;

  constructor(copyFrom?: ReplicationProperty) {
    if (copyFrom != undefined) {
      this.id = copyFrom.id;
      this.data = copyFrom.data;
      this.name = copyFrom.name;
    }
  }

  static deserialize(cache: CacheInfo, objectIdToName: string[], version: ReplayVersion, br: BinaryReader): ReplicationProperty {
    const p = new ReplicationProperty();

    // We've previously calculated the max the stream id can be for a
    // given type and how many bits that it encompasses so use those
    // values now
    p.id = br.readUInt32Max(cache.maxPropId);

    // Look the stream id up and find the corresponding attribute
    // decoding function. Experience has told me replays that fail to
    // parse, fail to do so here, so a large chunk is dedicated to
    // generating an error message with context
    const attrType = cache.attributes[p.id].attribute;

    if (attrType == undefined) {
      throw new Error(`Unknown attribute type ${p.id}`);
    }

    p.data = attrType.deserialize(br, version, objectIdToName);

    return p;
  }
}

export class ReplicationListProperty extends ReplicationProperty {
  constructor(property: ReplicationProperty) {
    super(property);
    this.data = [property];
  }

  add(property: ReplicationProperty) {
    if (this.id !== property.id) {
      throw new Error('Property id mismatch, can not add to list');
    }
    this.data.push(property);
  }
}
