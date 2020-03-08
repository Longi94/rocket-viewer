import { PlayerData } from '../../model/replay/player-data';
import {
  AnimationClip,
  AnimationMixer, AnimationObjectGroup,
  BooleanKeyframeTrack, LoopOnce, NumberKeyframeTrack,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from 'three';
import { ReplayScene } from '../replay-scene';
import { ColorHasher } from '../../util/util';
import { addAnimPathHelper } from '../../util/debug';
import { PlayerActor } from '../actor/player';

export function createCarAnimationMixer(playerData: PlayerData, rs: ReplayScene, maxTime: number, debug: boolean):
  AnimationMixer[] {
  // if (debug) {
  //   addAnimPathHelper(playerData.positions, ColorHasher.hex(playerData.name), rs.scene);
  // }
  const player = rs.players[playerData.id];
  return [
    createPositionMixer(playerData, player, maxTime),
    createRotationMixer(playerData, player, maxTime),
    createJumpMixer(playerData, player, maxTime),
    createWheelTurnMixer(playerData, player, maxTime),
    createDemoSpriteMixer(playerData, player, maxTime),
    createDemoSpriteTimeMixer(playerData, player, maxTime)
  ];
}

function createPositionMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  const states = playerData.body_states;
  const mixer = new AnimationMixer(player.body);
  const positionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const visibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);
  const clip = new AnimationClip(`car_position_${playerData.id}_clip`, maxTime, [positionTrack, visibleTrack]);
  mixer.clipAction(clip).play();
  return mixer;
}

function createRotationMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  const states = playerData.body_states;
  const mixer = new AnimationMixer(player.car);
  const track = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
  const clip = new AnimationClip(`car_rotation_${playerData.id}_clip`, maxTime, [track]);
  mixer.clipAction(clip).play();
  return mixer;
}

function createJumpMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  const mixer = new AnimationMixer(player.jumpSprite);
  const jumpData = playerData.jump_data;
  const track = new BooleanKeyframeTrack('.visible', jumpData.jump_times, jumpData.jump_visible);
  const clip = new AnimationClip(`car_jump_${playerData.id}_clip`, maxTime, [track]);
  mixer.clipAction(clip).play();
  return mixer;
}

function createWheelTurnMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  const data = playerData.car_data;
  const group = new AnimationObjectGroup();

  for (const bone of player.bodyModel.frontPivots) {
    group.add(bone);
  }

  const mixer = new AnimationMixer(group);
  const track = new QuaternionKeyframeTrack('.quaternion', data.steer_times, data.steer_values);
  const clip = new AnimationClip(`car_wheel_turn_${playerData.id}_clip`, maxTime, [track]);
  mixer.clipAction(clip).play();

  return mixer;
}

function createDemoSpriteMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  if (playerData.demolished.length <= 1) {
    return undefined;
  }
  const mixer = new AnimationMixer(player.demoSprite);
  const positionTrack = new VectorKeyframeTrack('.position', playerData.demolished_times, playerData.demo_pos);
  const visibleTrack = new BooleanKeyframeTrack('.visible', playerData.demolished_times, playerData.demolished);
  const clip = new AnimationClip(`car_demo_${playerData.id}_clip`, maxTime, [positionTrack, visibleTrack]);
  mixer.clipAction(clip).play();
  return mixer;
}

function createDemoSpriteTimeMixer(playerData: PlayerData, player: PlayerActor, maxTime: number): AnimationMixer {
  if (playerData.demolished.length <= 1) {
    return undefined;
  }
  const mixer = new AnimationMixer(player.demoTexture);
  const track = new NumberKeyframeTrack('.time', playerData.demolished_times, playerData.demolished.map(v => v ? 0 : 1));
  const clip = new AnimationClip(`car_demo_time_${playerData.id}_clip`, maxTime, [track]);
  mixer.clipAction(clip).play();
  return mixer;
}
