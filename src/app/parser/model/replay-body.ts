import { BinaryReader } from '../binary-reader';
import { KeyFrame } from './key-frame';
import { TickMark } from './tick-mark';
import { ClassMapping } from './class-mapping';
import { Cache } from './cache';
import { groupBy } from '../../util/array-util';
import { Frame } from './frame';
import { ReplayHeader } from './replay-header';

export class ReplayBody {

  length: number;
  crc: number;

  levels: string[];
  keyFrames: KeyFrame[];
  networkStream: Uint8Array;
  tickMarks: TickMark[];
  objects: string[];
  names: string[];
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

  fixClassParent(child: string, parent: string) {
    const parentClass = this.caches.find(c => this.objects[c.objectIndex] == parent);
    const childClass = this.caches.find(c => this.objects[c.objectIndex] == child);

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
    body.names = [];
    for (let i = 0; i < namesLength; i++) {
      body.names.push(br.readString());
    }

    const classMappingLength = br.readInt32();
    body.classMappings = [];
    for (let i = 0; i < classMappingLength; i++) {
      body.classMappings.push(ClassMapping.deserialize(br));
    }

    const cacheLength = br.readInt32();
    body.caches = new Array<Cache>(cacheLength);
    for (let i = 0; i < cacheLength; i++) {
      const cache = Cache.deserialize(br);
      body.caches[i] = cache;

      for (let j = i - 1; j >= 0; --j) {
        if (cache.parentId === body.caches[j].id) {
          cache.parent = body.caches[j];
          body.caches[j].children.push(cache);
          break;
        }
      }

      if (body.caches[i].parent == undefined) {
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
    // 2016/02/10 patch replays have TAGame.PRI_TA classes with no parent.
    // Deserialization may have failed somehow, but for now manually fix it up.
    body.fixClassParent("ProjectX.PRI_X", "Engine.PlayerReplicationInfo");
    body.fixClassParent("TAGame.PRI_TA", "ProjectX.PRI_X");

    // A lot of replays have messed up class hierarchies, commonly giving
    // both Engine.TeamInfo, TAGame.CarComponent_TA, and others the same id.
    // Some ambiguities may have become more common since the 2016-06-20 patch,
    // but there have always been issues.
    //
    // For example, from E8B66F8A4561A2DAACC61FA9FBB710CD:
    //    Index 26(TAGame.CarComponent_TA) ParentId 21 Id 24
    //        Index 28(TAGame.CarComponent_Dodge_TA) ParentId 24 Id 25
    //        Index 188(TAGame.CarComponent_Jump_TA) ParentId 24 Id 24
    //            Index 190(TAGame.CarComponent_DoubleJump_TA) ParentId 24 Id 24
    //    Index 30(Engine.Info) ParentId 21 Id 21
    //        Index 31(Engine.ReplicationInfo) ParentId 21 Id 21
    //            Index 195(Engine.TeamInfo) ParentId 21 Id 24
    //                Index 214(TAGame.CarComponent_Boost_TA) ParentId 24 Id 31
    //                Index 237(TAGame.CarComponent_FlipCar_TA) ParentId 24 Id 26
    // Problems:
    //     TAGame.CarComponent_Jump_TA's parent id and id are both 24 (happens to work fine in this case)
    //     TAGame.CarComponent_DoubleJump_TA's parent id and id are both 24 (incorrectly picks CarComponent_Jump_TA as parent)
    //     Engine.TeamInfo's ID is 24, even though there are 3 other classes with that id
    //     TAGame.CarComponent_Boost_TA's parent is 24 (Incorrectly picks Engine.TeamInfo, since it's ambiguous)
    //     TAGame.CarComponent_FlipCar_TA's parent is 24 (Incorrectly picks Engine.TeamInfo, since it's ambiguous)
    //     Engine.ReplicationInfo and Engine.Info have the same parent id and id (no ill effects so far)
    //
    // Note: The heirarchy problems do not always cause parsing errors! But they can if you're unlucky.

    body.fixClassParent("TAGame.CarComponent_Boost_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.CarComponent_FlipCar_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.CarComponent_Jump_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.CarComponent_Dodge_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.CarComponent_DoubleJump_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.GameEvent_TA", "Engine.Actor");
    body.fixClassParent("TAGame.SpecialPickup_TA", "TAGame.CarComponent_TA");
    body.fixClassParent("TAGame.SpecialPickup_BallVelcro_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.SpecialPickup_Targeted_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.SpecialPickup_Spring_TA", "TAGame.SpecialPickup_Targeted_TA");
    body.fixClassParent("TAGame.SpecialPickup_BallLasso_TA", "TAGame.SpecialPickup_Spring_TA");
    body.fixClassParent("TAGame.SpecialPickup_BoostOverride_TA", "TAGame.SpecialPickup_Targeted_TA");
    body.fixClassParent("TAGame.SpecialPickup_BallCarSpring_TA", "TAGame.SpecialPickup_Spring_TA");
    body.fixClassParent("TAGame.SpecialPickup_BallFreeze_TA", "TAGame.SpecialPickup_Targeted_TA");
    body.fixClassParent("TAGame.SpecialPickup_Swapper_TA", "TAGame.SpecialPickup_Targeted_TA");
    body.fixClassParent("TAGame.SpecialPickup_GrapplingHook_TA", "TAGame.SpecialPickup_Targeted_TA");
    body.fixClassParent("TAGame.SpecialPickup_BallGravity_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.SpecialPickup_HitForce_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.SpecialPickup_Tornado_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.SpecialPickup_HauntedBallBeam_TA", "TAGame.SpecialPickup_TA");
    body.fixClassParent("TAGame.CarComponent_TA", "Engine.Actor");
    body.fixClassParent("Engine.Info", "Engine.Actor");
    body.fixClassParent("Engine.Pawn", "Engine.Actor");

    // Havent had problems with these yet. They (among others) can be ambiguous,
    // but I havent found a replay yet where my parent choosing algorithm
    // (which picks the matching class that was most recently read) picks the wrong class.
    // Just a safeguard for now.
    body.fixClassParent("Engine.TeamInfo", "Engine.ReplicationInfo");
    body.fixClassParent("TAGame.Team_TA", "Engine.TeamInfo");

    body.frames = Frame.extractFrames(maxChannels, body.networkStream.buffer, body.objects, body.caches, header.version);

    if (br.bitPos != br.length() * 8) {
      throw Error('Extra data left');
    }

    return body;
  }
}
