import { BinaryReader } from '../parser/binary-reader';

export class CacheProperty {
  index: number;
  id: number;

  static deserialize(br: BinaryReader) {
    const p = new CacheProperty();
    p.index = br.readInt32();
    p.id = br.readInt32();
    return p;
  }
}

export class Cache {
  objectIndex: number;
  parentId: number;
  id: number;
  properties: { [name: string]: CacheProperty };
  children: Cache[];
  parent: Cache;
  root: boolean;

  getMaxPropertyId() {
    let maxId = 0;

    for (const prop of Object.values(this.properties)) {
      if (prop.id > maxId) {
        maxId = prop.id;
      }
    }
    return maxId;
  }

  static deserialize(br: BinaryReader) {
    const c = new Cache();

    c.objectIndex = br.readInt32();
    c.parentId = br.readInt32();
    c.id = br.readInt32();

    c.children = [];

    const propertiesLength = br.readInt32();
    c.properties = {};

    for (let i = 0; i < propertiesLength; i++) {
      const prop = CacheProperty.deserialize(br);
      c.properties[prop.id] = prop;
    }

    return c;
  }
}
