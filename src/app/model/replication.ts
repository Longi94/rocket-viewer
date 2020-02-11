import { Cache } from './cache';
import { BinaryReader } from '../parser/binary-reader';
import { ReplayVector } from './replay-vector';
import { Rotation } from './rotation';
import { ReplicationListProperty, ReplicationProperty } from './replication-property';
import { ReplayVersion } from './replay-header';

export enum ActorState {
  CREATED, UPDATED, DELETED
}

export class Replication {

  actorId: number;
  actorState: ActorState;
  nameId: number;
  typeId: number;
  classId: number;
  cache: Cache;

  position: ReplayVector;
  rotation: Rotation;

  properties: { [key: number]: ReplicationProperty } = {};

  static deserialize(maxChannels: number, existingReplications: { [key: number]: Replication }, replications: Replication[],
                     objectIdToName: string[], caches: { [key: string]: Cache }, version: ReplayVersion,
                     br: BinaryReader): Replication {
    const r = new Replication();

    r.actorId = br.readUInt32Max(maxChannels);

    if (br.readBit()) {
      if (br.readBit()) {
        r.actorState = ActorState.CREATED;

        if (version.engine > 868 || (version.engine == 868 && version.licensee >= 14)) {
          r.nameId = br.readUInt32();
        }

        // unknown
        br.skipBits(1);

        r.typeId = br.readUInt32();

        const typeName = objectIdToName[r.typeId];

        const cache = caches[getRawObjectClass(typeName)];
        r.cache = cache;
        r.classId = cache.objectIndex;

        if (!RAW_CLASSES_WITH_LOCATION.has(objectIdToName[r.classId])) {
          return r;
        }

        r.position = ReplayVector.deserialize(br, version);

        if (RAW_CLASSES_WITH_ROTATION.has(objectIdToName[r.classId])) {
          r.rotation = Rotation.deserialize(br);
        }

      } else {
        r.actorState = ActorState.UPDATED;
        const oldState = existingReplications[r.actorId];

        let lastProp: ReplicationProperty;

        while (br.readBit()) {
          lastProp = ReplicationProperty.deserialize(oldState.cache, objectIdToName, version, br);

          if (!(lastProp.id in r.properties)) {
            r.properties[lastProp.id] = lastProp;
          } else {
            const existingProperty = r.properties[lastProp.id];

            let listProperty: ReplicationListProperty;
            if (existingProperty instanceof ReplicationListProperty) {
              listProperty = existingProperty as ReplicationListProperty;
            } else {
              listProperty = new ReplicationListProperty(existingProperty);
              r.properties[listProperty.id] = listProperty;
            }

            listProperty.add(lastProp);
          }
        }
      }
    } else {
      r.actorState = ActorState.DELETED;
    }

    return r;
  }
}

const RAW_OBJECT_CLASSES = {
  'Archetypes.Ball.Ball_BasketBall_Mutator': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_Basketball': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_BasketBall': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_Beachball': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_Breakout': 'TAGame.Ball_Breakout_TA',
  'Archetypes.Ball.Ball_Default': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_Haunted': 'TAGame.Ball_Haunted_TA',
  'Archetypes.Ball.Ball_Puck': 'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_Anniversary': 'TAGame.Ball_TA',
  'Archetypes.Ball.CubeBall': 'TAGame.Ball_TA',
  'Archetypes.Car.Car_Default': 'TAGame.Car_TA',
  'Archetypes.CarComponents.CarComponent_Boost': 'TAGame.CarComponent_Boost_TA',
  'Archetypes.CarComponents.CarComponent_Dodge': 'TAGame.CarComponent_Dodge_TA',
  'Archetypes.CarComponents.CarComponent_DoubleJump': 'TAGame.CarComponent_DoubleJump_TA',
  'Archetypes.CarComponents.CarComponent_FlipCar': 'TAGame.CarComponent_FlipCar_TA',
  'Archetypes.CarComponents.CarComponent_Jump': 'TAGame.CarComponent_Jump_TA',
  'Archetypes.GameEvent.GameEvent_Basketball': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_BasketballPrivate': 'TAGame.GameEvent_SoccarPrivate_TA',
  'Archetypes.GameEvent.GameEvent_BasketballSplitscreen': 'TAGame.GameEvent_SoccarSplitscreen_TA',
  'Archetypes.GameEvent.GameEvent_Breakout': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_Hockey': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_HockeyPrivate': 'TAGame.GameEvent_SoccarPrivate_TA',
  'Archetypes.GameEvent.GameEvent_HockeySplitscreen': 'TAGame.GameEvent_SoccarSplitscreen_TA',
  'Archetypes.GameEvent.GameEvent_Items': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_Season': 'TAGame.GameEvent_Season_TA',
  'Archetypes.GameEvent.GameEvent_Season:CarArchetype': 'TAGame.Car_TA',
  'Archetypes.GameEvent.GameEvent_Soccar': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_SoccarLan': 'TAGame.GameEvent_Soccar_TA',
  'Archetypes.GameEvent.GameEvent_SoccarPrivate': 'TAGame.GameEvent_SoccarPrivate_TA',
  'Archetypes.GameEvent.GameEvent_SoccarSplitscreen': 'TAGame.GameEvent_SoccarSplitscreen_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BallFreeze': 'TAGame.SpecialPickup_BallFreeze_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BallGrapplingHook': 'TAGame.SpecialPickup_GrapplingHook_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BallLasso': 'TAGame.SpecialPickup_BallLasso_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BallSpring': 'TAGame.SpecialPickup_BallCarSpring_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BallVelcro': 'TAGame.SpecialPickup_BallVelcro_TA',
  'Archetypes.SpecialPickups.SpecialPickup_Batarang': 'TAGame.SpecialPickup_Batarang_TA',
  'Archetypes.SpecialPickups.SpecialPickup_BoostOverride': 'TAGame.SpecialPickup_BoostOverride_TA',
  'Archetypes.SpecialPickups.SpecialPickup_CarSpring': 'TAGame.SpecialPickup_BallCarSpring_TA',
  'Archetypes.SpecialPickups.SpecialPickup_GravityWell': 'TAGame.SpecialPickup_BallGravity_TA',
  'Archetypes.SpecialPickups.SpecialPickup_StrongHit': 'TAGame.SpecialPickup_HitForce_TA',
  'Archetypes.SpecialPickups.SpecialPickup_Swapper': 'TAGame.SpecialPickup_Swapper_TA',
  'Archetypes.SpecialPickups.SpecialPickup_Tornado': 'TAGame.SpecialPickup_Tornado_TA',
  'Archetypes.SpecialPickups.SpecialPickup_HauntedBallBeam': 'TAGame.SpecialPickup_HauntedBallBeam_TA',
  'Archetypes.SpecialPickups.SpecialPickup_Rugby': 'TAGame.SpecialPickup_Rugby_TA',
  'Archetypes.Teams.Team0': 'TAGame.Team_Soccar_TA',
  'Archetypes.Teams.Team1': 'TAGame.Team_Soccar_TA',
  'GameInfo_Basketball.GameInfo.GameInfo_Basketball:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'GameInfo_Breakout.GameInfo.GameInfo_Breakout:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'Gameinfo_Hockey.GameInfo.Gameinfo_Hockey:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'GameInfo_Items.GameInfo.GameInfo_Items:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'GameInfo_Season.GameInfo.GameInfo_Season:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'GameInfo_Soccar.GameInfo.GameInfo_Soccar:GameReplicationInfoArchetype': 'TAGame.GRI_TA',
  'ProjectX.Default__NetModeReplicator_X': 'ProjectX.NetModeReplicator_X',
  'TAGame.Default__CameraSettingsActor_TA': 'TAGame.CameraSettingsActor_TA',
  'TAGame.Default__PRI_TA': 'TAGame.PRI_TA',
  'TheWorld:PersistentLevel.BreakOutActor_Platform_TA': 'TAGame.BreakOutActor_Platform_TA',
  'TheWorld:PersistentLevel.CrowdActor_TA': 'TAGame.CrowdActor_TA',
  'TheWorld:PersistentLevel.CrowdManager_TA': 'TAGame.CrowdManager_TA',
  'TheWorld:PersistentLevel.InMapScoreboard_TA': 'TAGame.InMapScoreboard_TA',
  'TheWorld:PersistentLevel.VehiclePickup_Boost_TA': 'TAGame.VehiclePickup_Boost_TA',
  'Haunted_TrainStation_P.TheWorld:PersistentLevel.HauntedBallTrapTrigger_TA_1': 'TAGame.HauntedBallTrapTrigger_TA',
  'Haunted_TrainStation_P.TheWorld:PersistentLevel.HauntedBallTrapTrigger_TA_0': 'TAGame.HauntedBallTrapTrigger_TA'
};

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
  'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_BasketBall_Mutator',
  'Archetypes.Ball.Ball_BasketBall',
  'Archetypes.Ball.Ball_Basketball',
  'Archetypes.Ball.Ball_Default',
  'Archetypes.Ball.Ball_Puck',
  'Archetypes.Ball.CubeBall',
  'Archetypes.Ball.Ball_Haunted',
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
  'TAGame.Default__CameraSettingsActor_TA',
  'TAGame.Default__PRI_TA',
  'TheWorld:PersistentLevel.BreakOutActor_Platform_TA',
  'TheWorld:PersistentLevel.CrowdActor_TA',
  'TheWorld:PersistentLevel.CrowdManager_TA',
  'TheWorld:PersistentLevel.InMapScoreboard_TA',
  'TheWorld:PersistentLevel.VehiclePickup_Boost_TA',
  'TAGame.HauntedBallTrapTrigger_TA',
  'ProjectX.NetModeReplicator_X'
]);

const RAW_CLASSES_WITH_ROTATION = new Set<string>([
  'TAGame.Ball_Breakout_TA',
  'Archetypes.Ball.Ball_Breakout',
  'TAGame.Ball_TA',
  'Archetypes.Ball.Ball_BasketBall_Mutator',
  'Archetypes.Ball.Ball_BasketBall',
  'Archetypes.Ball.Ball_Basketball',
  'Archetypes.Ball.Ball_Default',
  'Archetypes.Ball.Ball_Puck',
  'Archetypes.Ball.CubeBall',
  'Archetypes.Ball.Ball_Haunted',
  'TAGame.Ball_Haunted_TA',
  'TAGame.Car_Season_TA',
  'TAGame.Car_TA',
  'Archetypes.Car.Car_Default',
  'Archetypes.GameEvent.GameEvent_Season:CarArchetype',
  'Archetypes.SpecialPickups.SpecialPickup_HauntedBallBeam',
  'Archetypes.SpecialPickups.SpecialPickup_Rugby'
]);
