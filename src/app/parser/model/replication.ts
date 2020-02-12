import { CacheInfo, NetCache } from './net-cache';
import { BinaryReader } from '../binary-reader';
import { ReplayVector } from './replay-vector';
import { Rotation } from './rotation';
import { ReplicationListProperty, ReplicationProperty } from './replication-property';
import { ReplayVersion } from './replay-header';
import { RAW_OBJECT_CLASSES } from '../const';

export enum ActorState {
  CREATED, UPDATED, DELETED
}

export class Replication {

  actorId: number;
  actorState: ActorState;
  nameId: number;
  objectId: number;
  classId: number;
  cache: NetCache;

  position: ReplayVector;
  rotation: Rotation;

  properties: { [key: number]: ReplicationProperty } = {};

  static deserialize(maxChannels: number, existingReplications: { [p: number]: Replication },
                     br: BinaryReader, objectIndAttrs: { [p: string]: CacheInfo }, version: ReplayVersion,
                     isLan: boolean, objectIdToName: string[]): Replication {
    const r = new Replication();

    r.actorId = br.readUInt32Max(maxChannels);

    if (br.readBit()) {
      if (br.readBit()) {
        r.actorState = ActorState.CREATED;

        if (version.ge(868, 14, 0) && !isLan) {
          r.nameId = br.readUInt32();
        }

        // unknown
        br.skipBits(1);

        r.objectId = br.readUInt32();

        const objectName = objectIdToName[r.objectId];

        if (!RAW_CLASSES_WITH_LOCATION.has(objectName)) {
          return r;
        }

        r.position = ReplayVector.deserialize(br, version);

        if (RAW_CLASSES_WITH_ROTATION.has(objectName)) {
          r.rotation = Rotation.deserialize(br);
        }

        existingReplications[r.actorId] = r;

      } else {
        r.actorState = ActorState.UPDATED;

        const objectId = existingReplications[r.actorId].objectId;
        const cacheInfo = objectIndAttrs[objectId];

        while (br.readBit()) {
          const property = ReplicationProperty.deserialize(cacheInfo, objectIdToName, version, br);
          r.properties[property.id] = property;
        }
      }
    } else {
      r.actorState = ActorState.DELETED;
    }

    return r;
  }
}


function getRawObjectClass(type: string) {
  let _class = RAW_OBJECT_CLASSES[type];

  if (_class !== undefined) {
    return _class;
  }

  if (type.indexOf('CrowdActor_TA') >= -1) {
    return 'TAGame.CrowdActor_TA';
  }
  if (type.indexOf('VehiclePickup_Boost_TA') >= -1) {
    return 'TAGame.VehiclePickup_Boost_TA';
  }
  if (type.indexOf('CrowdManager_TA') >= -1) {
    return 'TAGame.CrowdManager_TA';
  }
  if (type.indexOf('BreakOutActor_Platform_TA') >= -1) {
    return 'TAGame.BreakOutActor_Platform_TA';
  }
}

const RAW_CLASSES_WITH_LOCATION = new Set<string>([
  'TAGame.Ball_Breakout_TA',
  'Archetypes.Ball.Ball_Breakout',
  'Archetypes.Ball.Ball_Trajectory',
  'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_BasketBall_Mutator',
  'Archetypes.Ball.Ball_BasketBall',
  'Archetypes.Ball.Ball_Basketball',
  'Archetypes.Ball.Ball_Default',
  'Archetypes.Ball.Ball_Puck',
  'Archetypes.Ball.Ball_Anniversary',
  'Archetypes.Ball.CubeBall',
  'Archetypes.Ball.Ball_Haunted',
  'Archetypes.Ball.Ball_Training',
  'TAGame.Ball_Haunted_TA',
  'TAGame.Car_Season_TA',
  'TAGame.Car_TA',
  'Archetypes.Car.Car_Default',
  'Archetypes.GameEvent.GameEvent_Season:CarArchetype',
  'Archetypes.SpecialPickups.SpecialPickup_HauntedBallBeam',
  'Archetypes.SpecialPickups.SpecialPickup_Rugby',
  'TAGame.CameraSettingsActor_TA',
  'TAGame.CarComponent_Boost_TA',
  'TAGame.CarComponent_Dodge_TA',
  'TAGame.CarComponent_DoubleJump_TA',
  'TAGame.CarComponent_FlipCar_TA',
  'TAGame.CarComponent_Jump_TA',
  'TAGame.GameEvent_Season_TA',
  'TAGame.GameEvent_Soccar_TA',
  'TAGame.GameEvent_SoccarPrivate_TA',
  'TAGame.GameEvent_SoccarSplitscreen_TA',
  'TAGame.GRI_TA',
  'TAGame.PRI_TA',
  'TAGame.SpecialPickup_BallCarSpring_TA',
  'TAGame.SpecialPickup_BallFreeze_TA',
  'TAGame.SpecialPickup_BallGravity_TA',
  'TAGame.SpecialPickup_BallLasso_TA',
  'TAGame.SpecialPickup_BallVelcro_TA',
  'TAGame.SpecialPickup_Batarang_TA',
  'TAGame.SpecialPickup_BoostOverride_TA',
  'TAGame.SpecialPickup_GrapplingHook_TA',
  'TAGame.SpecialPickup_HitForce_TA',
  'TAGame.SpecialPickup_Swapper_TA',
  'TAGame.SpecialPickup_Tornado_TA',
  'TAGame.Team_Soccar_TA',
  'Archetypes.CarComponents.CarComponent_Boost',
  'Archetypes.CarComponents.CarComponent_Dodge',
  'Archetypes.CarComponents.CarComponent_DoubleJump',
  'Archetypes.CarComponents.CarComponent_FlipCar',
  'Archetypes.CarComponents.CarComponent_Jump',
  'Archetypes.GameEvent.GameEvent_Basketball',
  'Archetypes.GameEvent.GameEvent_BasketballPrivate',
  'Archetypes.GameEvent.GameEvent_BasketballSplitscreen',
  'Archetypes.GameEvent.GameEvent_Breakout',
  'Archetypes.GameEvent.GameEvent_Hockey',
  'Archetypes.GameEvent.GameEvent_HockeyPrivate',
  'Archetypes.GameEvent.GameEvent_HockeySplitscreen',
  'Archetypes.GameEvent.GameEvent_Items',
  'Archetypes.GameEvent.GameEvent_Season',
  'Archetypes.GameEvent.GameEvent_Soccar',
  'Archetypes.GameEvent.GameEvent_SoccarLan',
  'Archetypes.GameEvent.GameEvent_SoccarPrivate',
  'Archetypes.GameEvent.GameEvent_SoccarSplitscreen',
  'Archetypes.SpecialPickups.SpecialPickup_BallFreeze',
  'Archetypes.SpecialPickups.SpecialPickup_BallGrapplingHook',
  'Archetypes.SpecialPickups.SpecialPickup_BallLasso',
  'Archetypes.SpecialPickups.SpecialPickup_BallSpring',
  'Archetypes.SpecialPickups.SpecialPickup_BallVelcro',
  'Archetypes.SpecialPickups.SpecialPickup_Batarang',
  'Archetypes.SpecialPickups.SpecialPickup_BoostOverride',
  'Archetypes.SpecialPickups.SpecialPickup_CarSpring',
  'Archetypes.SpecialPickups.SpecialPickup_GravityWell',
  'Archetypes.SpecialPickups.SpecialPickup_StrongHit',
  'Archetypes.SpecialPickups.SpecialPickup_Swapper',
  'Archetypes.SpecialPickups.SpecialPickup_Tornado',
  'Archetypes.Teams.Team0',
  'Archetypes.Teams.Team1',
  'GameInfo_Basketball.GameInfo.GameInfo_Basketball:GameReplicationInfoArchetype',
  'GameInfo_Breakout.GameInfo.GameInfo_Breakout:GameReplicationInfoArchetype',
  'Gameinfo_Hockey.GameInfo.Gameinfo_Hockey:GameReplicationInfoArchetype',
  'GameInfo_Items.GameInfo.GameInfo_Items:GameReplicationInfoArchetype',
  'GameInfo_Season.GameInfo.GameInfo_Season:GameReplicationInfoArchetype',
  'GameInfo_Soccar.GameInfo.GameInfo_Soccar:GameReplicationInfoArchetype',
  'GameInfo_Tutorial.GameInfo.GameInfo_Tutorial:GameReplicationInfoArchetype',
  'TAGame.Default__CameraSettingsActor_TA',
  'TAGame.Default__PRI_TA',
  'TheWorld:PersistentLevel.BreakOutActor_Platform_TA',
  'TheWorld:PersistentLevel.CrowdActor_TA',
  'TheWorld:PersistentLevel.CrowdManager_TA',
  'TheWorld:PersistentLevel.InMapScoreboard_TA',
  'TheWorld:PersistentLevel.VehiclePickup_Boost_TA',
  'TAGame.HauntedBallTrapTrigger_TA',
  'ProjectX.Default__NetModeReplicator_X',
  'GameInfo_Tutorial.GameEvent.GameEvent_Tutorial_Aerial',
  'Archetypes.Tutorial.Cannon'
]);

const RAW_CLASSES_WITH_ROTATION = new Set<string>([
  'TAGame.Ball_Breakout_TA',
  'Archetypes.Ball.Ball_Breakout',
  'Archetypes.Ball.Ball_Trajectory',
  'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_BasketBall_Mutator',
  'Archetypes.Ball.Ball_BasketBall',
  'Archetypes.Ball.Ball_Basketball',
  'Archetypes.Ball.Ball_Default',
  'Archetypes.Ball.Ball_Puck',
  'Archetypes.Ball.Ball_Anniversary',
  'Archetypes.Ball.CubeBall',
  'Archetypes.Ball.Ball_Haunted',
  'Archetypes.Ball.Ball_Training',
  'TAGame.Ball_Haunted_TA',
  'TAGame.Car_Season_TA',
  'TAGame.Car_TA',
  'Archetypes.Car.Car_Default',
  'Archetypes.GameEvent.GameEvent_Season:CarArchetype'
]);
