import { BinaryReader } from '../binary-reader';

export class CacheProperty {
  objectIndex: number;
  streamId: number;

  static deserialize(br: BinaryReader) {
    const p = new CacheProperty();
    p.objectIndex = br.readInt32();
    p.streamId = br.readInt32();
    return p;
  }
}

export class NetCache {
  objectIndex: number;
  parentId: number;
  id: number;
  properties: { [name: string]: CacheProperty };
  children: NetCache[];
  parent: NetCache;
  root: boolean;

  getMaxPropertyId() {
    let maxId = 0;

    let currentCache: NetCache = this;

    while (currentCache != undefined) {
      for (const prop of Object.values(this.properties)) {
        if (prop.streamId > maxId) {
          maxId = prop.streamId;
        }
      }
      currentCache = currentCache.parent;
    }
    return maxId;
  }

  getProperty(id: number) {
    const prop = this.properties[id];
    if (prop != undefined) {
      return prop;
    }
    if (this.parent != undefined) {
      return this.parent.getProperty(id);
    }
    return undefined;
  }

  static deserialize(br: BinaryReader) {
    const c = new NetCache();

    c.objectIndex = br.readInt32();
    c.parentId = br.readInt32();
    c.id = br.readInt32();

    c.children = [];

    const propertiesLength = br.readInt32();
    c.properties = {};

    for (let i = 0; i < propertiesLength; i++) {
      const prop = CacheProperty.deserialize(br);
      c.properties[prop.streamId] = prop;
    }

    return c;
  }
}

export class CacheInfo {
  maxPropId: number;
  attributes: any[];
}
