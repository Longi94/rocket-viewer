import { BinaryReader } from '../binary-reader';
import { NetCache } from './net-cache';
import { RAW_ATTRIBUTE_TYPES } from './attribute/mapping';
import { ReplayVersion } from './replay-header';

export class ReplicationProperty {
  id: number;
  data: any;

  name: string;
  cache: NetCache;

  constructor(copyFrom?: ReplicationProperty) {
    if (copyFrom != undefined) {
      this.id = copyFrom.id;
      this.data = copyFrom.data;
      this.name = copyFrom.name;
      this.cache = copyFrom.cache;
    }
  }

  static deserialize(cache: NetCache, objectIdToName: string[], version: ReplayVersion, br: BinaryReader): ReplicationProperty {
    const p = new ReplicationProperty();

    p.cache = cache;

    p.id = br.readUInt32Max(cache.getMaxPropertyId() + 1);
    p.name = objectIdToName[cache.getProperty(p.id).index];

    const attrType = RAW_ATTRIBUTE_TYPES[p.name];

    if (attrType == undefined) {
      throw new Error(`Unknown attribute type ${p.name}`);
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
