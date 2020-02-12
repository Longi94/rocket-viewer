import { BinaryReader } from '../binary-reader';
import { KeyFrame } from './key-frame';
import { TickMark } from './tick-mark';
import { ClassIndex } from './class-index';
import { CacheInfo, NetCache } from './net-cache';
import { Frame } from './frame';
import { ReplayHeader, ReplayVersion } from './replay-header';
import { normalizeObject } from '../util';
import { RAW_ATTRIBUTE_TYPES } from './attribute/mapping';
import { RAW_OBJECT_CLASSES, RAW_PARENT_CLASSES } from '../const';
import { Replication } from './replication';

export class ReplayBody {

  length: number;
  crc: number;

  levels: string[];
  keyFrames: KeyFrame[];
  networkStream: Uint8Array;
  debugStrings: string[];
  tickMarks: TickMark[];
  objects: string[];
  names: string[];
  packages: string[];
  classIndices: ClassIndex[];
  netCaches: NetCache[];
  frames: Frame[];

  fixClassParent(child: string, parent: string) {
    const parentClass = this.netCaches.find(c => this.objects[c.objectIndex] == parent);
    const childClass = this.netCaches.find(c => this.objects[c.objectIndex] == child);

    if (parentClass != undefined && childClass != undefined && (childClass.parent == undefined || childClass.parent != parentClass)) {
      const oldParent = childClass.parent == undefined ? 'NULL' : this.objects[childClass.parent.objectIndex];
      console.debug(`Fixing class ${child}, setting its parent to ${parent} from ${oldParent}`);

      childClass.root = false;
      if (childClass.parent != null) {
        const index = childClass.parent.children.indexOf(childClass);
        if (index > -1) {
          childClass.parent.children = childClass.parent.children.splice(index, 1);
        }
      }
      childClass.parent = parentClass;
      parentClass.children.push(childClass);
    }
  }

  static deserialize(br: BinaryReader, header: ReplayHeader) {
    const body = new ReplayBody();

    body.length = br.readInt32();
    body.crc = br.readUInt32();

    body.levels = br.readStringList();

    body.keyFrames = br.readDeserializableList(KeyFrame);

    const networkStreamLength = br.readInt32();
    body.networkStream = br.readBytes(networkStreamLength);

    body.debugStrings = br.readStringList();
    body.tickMarks = br.readDeserializableList(TickMark);
    body.packages = br.readStringList();
    body.objects = br.readStringList();
    body.names = br.readStringList();

    body.classIndices = br.readDeserializableList(ClassIndex);
    body.netCaches = br.readDeserializableList(NetCache);

    if (header.version.net >= 10) {
      // unknown
      br.skipBytes(4);
    }

    const normalizedObjects = body.objects.map(normalizeObject);
    const normalizedNameObjInd: { [name: string]: number[] } = {};
    for (let i = 0; i < normalizedObjects.length; i++) {
      const name = normalizedObjects[i];
      if (name in normalizedNameObjInd) {
        normalizedNameObjInd[name].push(i);
      } else {
        normalizedNameObjInd[name] = [i];
      }
    }

    const nameObjInd: { [name: string]: number[] } = {};
    for (const name of body.objects) {
      if (name in normalizedNameObjInd) {
        nameObjInd[name] = normalizedNameObjInd[name].slice();
      } else {
        nameObjInd[name] = [];
      }
    }

    const objectIndAttrs = {};
    for (const cache of body.netCaches) {
      let allProps = {};
      for (const p of Object.values(cache.properties)) {
        const attr = RAW_ATTRIBUTE_TYPES[normalizedObjects[p.objectIndex]];
        allProps[p.streamId] = {attribute: attr, objectId: p.objectIndex};
      }

      let hadParent = false;

      // We are going to recursively resolve an object's name to find their direct parent.
      // Parents have parents as well (etc), so we repeatedly walk up the chain picking up
      // attributes on parent objects until we reach an object with no parent (`Core.Object`)
      let objectName = body.objects[cache.objectIndex];

      let parentName = RAW_PARENT_CLASSES[objectName];
      while (parentName != undefined) {
        hadParent = true;
        let parentIds = nameObjInd[parentName];
        if (parentIds != undefined) {
          for (const parentId of parentIds) {
            const parentAttrs = objectIndAttrs[parentId];
            if (parentAttrs != undefined) {
              allProps = Object.assign({}, allProps, parentAttrs);
            }
          }
        }
        parentName = RAW_PARENT_CLASSES[parentName];
      }

      // Sometimes our hierarchy set up in build.rs isn't perfect so if we don't find a
      // parent and a parent cache id is set, try and find this parent id and carry down
      // their props.
      if (!hadParent && cache.parentId !== 0) {
        const parent = body.netCaches.find(x => x.id == cache.parentId);
        if (parent != undefined) {
          const parentAttrs = objectIndAttrs[parent.objectIndex];
          if (parentAttrs != undefined) {
            allProps = Object.assign({}, allProps, parentAttrs);
          }
        }
      }

      objectIndAttrs[cache.objectIndex] = allProps;
    }

    for (const obj in RAW_OBJECT_CLASSES) {
      const parent = RAW_OBJECT_CLASSES[obj];

      // It's ok if an object class doesn't appear in our replay. For instance, basketball
      // objects don't appear in a soccer replay.
      const objectIds = normalizedNameObjInd[obj];
      if (objectIds != undefined) {
        const parentIds = nameObjInd[parent];

        for (const i of objectIds) {
          for (const parentId of parentIds) {
            const parentAttrs = Object.assign({}, objectIndAttrs[parentId]);
            if (i in objectIndAttrs) {
              objectIndAttrs[i] = Object.assign(objectIndAttrs[i], parentAttrs);
            } else {
              objectIndAttrs[i] = parentAttrs;
            }
          }
        }
      }
    }

    const objectIndAttributes: { [id: number]: CacheInfo } = {};
    for (const objId in objectIndAttrs) {
      const attrs = objectIndAttrs[objId];
      const c = new CacheInfo();
      const id = objId;

      let max = undefined;
      for (const i in attrs) {
        if (max == undefined || parseInt(i) > max) {
          max = parseInt(i);
        }
      }
      if (max == undefined) {
        max = 2;
      }
      max++;
      c.maxPropId = max;
      c.attributes = attrs;
      objectIndAttributes[id] = c;
    }

    const maxChannels = header.getProperty('MaxChannels', 1023);
    const frameCount = header.getProperty('NumFrames');
    const isLan = header.getProperty('MatchType') === 'Lan';

    if (frameCount > body.networkStream.length) {
      throw new Error('too many frames');
    }

    body.frames = decodeFrames(frameCount, maxChannels, body, objectIndAttributes, header.version, isLan, body.objects);

    if (br.bitPos != br.length() * 8) {
      throw Error('Extra data left');
    }

    return body;
  }
}

function decodeFrames(frameCount: any, maxChannels: any, body: ReplayBody, objectIndAttrs: { [id: number]: CacheInfo },
                      version: ReplayVersion, isLan: boolean, objectIdToName: string[]) {
  const frames: Frame[] = [];

  const replications: { [key: number]: Replication } = {};
  const streamReader = new BinaryReader(body.networkStream.buffer);

  while (streamReader.hasBits() && frames.length < frameCount) {
    const f = Frame.deserialize(maxChannels, replications, streamReader, objectIndAttrs, version, isLan,
      objectIdToName);

    if (frames.length > 0 && f.time != 0 && frames[frames.length - 1].time > f.time) {
      throw new Error('Frame time is less than the previous frame\'s time.');
    }

    frames.push(f);
  }

  return frames;
}
