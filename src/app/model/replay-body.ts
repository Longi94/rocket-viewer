import { BinaryReader } from '../parser/binary-reader';
import { KeyFrame } from './key-frame';
import { TickMark } from './tick-mark';
import { ClassMapping } from './class-mapping';
import { Cache } from './cache';
import { groupBy } from '../util/array-util';
import { Frame } from './frame';
import { ReplayHeader } from './replay-header';

export class ReplayBody {

  length: number;
  crc: number;

  levels: string[];
  keyFrames: KeyFrame[];
  networkStream: ArrayBuffer;
  tickMarks: TickMark[];
  objects: string[];
  //names: string[];
  classMappings: ClassMapping[];
  caches: Cache[];
  frames: Frame[];

  mergedDuplicateClasses() {
    // Rarely, a class is defined multiple times.
    // See replay 5F9D44B6400E284FD15A95AC8D5C5B45 which has 2 entries for TAGame.GameEvent_Soccar_TA
    // Merge their properties and drop the extras to keep everything from starting on fire

    const deleted = new Set<Cache>();

    const groups = groupBy(this.caches, 'objectIndex');

    for (const group of Object.values<Cache[]>(groups)) {
      if (group.length === 1) {
        continue;
      }

      const goodClass = group[0];
      for (let i = 1; i < group.length; i++) {
        const badClass = group[i];
        for (const p of Object.values(badClass.properties)) {
          goodClass.properties[p.id] = p;
        }
        deleted.add(badClass);
      }
    }

    this.caches = this.caches.filter(value => !deleted.has(value));
  }

  static deserialize(br: BinaryReader, header: ReplayHeader) {
    const body = new ReplayBody();

    body.length = br.readInt32();
    body.crc = br.readUInt32();

    const levelLength = br.readInt32();
    body.levels = [];
    for (let i = 0; i < levelLength; i++) {
      body.levels.push(br.readString());
    }

    const keyFrameLength = br.readInt32();
    body.keyFrames = [];
    for (let i = 0; i < keyFrameLength; i++) {
      body.keyFrames.push(KeyFrame.deserialize(br));
    }

    const networkStreamLength = br.readInt32();
    body.networkStream = br.readBytes(networkStreamLength);

    // skip debug strings
    const debugStringLength = br.readInt32();
    for (let i = 0; i < debugStringLength; i++) {
      br.skipString();
    }

    const tickMarkLength = br.readInt32();
    body.tickMarks = [];
    for (let i = 0; i < tickMarkLength; i++) {
      body.tickMarks.push(TickMark.deserialize(br));
    }

    // skip packages
    const packagesLength = br.readInt32();
    for (let i = 0; i < packagesLength; i++) {
      br.skipString();
    }

    const objectsLength = br.readInt32();
    body.objects = [];
    for (let i = 0; i < objectsLength; i++) {
      body.objects.push(br.readString());
    }

    // Skip names for now
    const namesLength = br.readInt32();
    // body.names = [];
    for (let i = 0; i < namesLength; i++) {
      br.skipString();
      // body.names.push(br.readString());
    }

    const classMappingLength = br.readInt32();
    body.classMappings = [];
    for (let i = 0; i < classMappingLength; i++) {
      body.classMappings.push(ClassMapping.deserialize(br));
    }

    const cacheLength = br.readInt32();
    body.caches = [];
    for (let i = 0; i < cacheLength; i++) {
      const cache = Cache.deserialize(br);
      body.caches.push(cache);

      for (let j = i - 1; j >= 0; --j) {
        if (cache.parentId === body.caches[j].id) {
          cache.parent = body.caches[j];
          body.caches[j].children.push(cache);
          break;
        }
      }

      if (body.caches[i].parent == null) {
        body.caches[i].root = true;
      }
    }

    if (header.version.net >= 10) {
      // unknown
      br.skipBytes(4);
    }

    // body.mergedDuplicateClasses();

    let maxChannels = 1023;
    if ('MaxChannels' in header.properties && header.properties['MaxChannels'] != undefined) {
      maxChannels = header.properties['MaxChannels'].value;
    }

    body.frames = Frame.extractFrames(maxChannels, body.networkStream, body.objects, body.caches, header.version, br);

    if (br.bitPos != br.length() * 8) {
      throw Error('Extra data left');
    }

    return body;
  }
}
