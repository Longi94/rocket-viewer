import { PlayerData } from '../../model/replay/player-data';
import {
  AnimationClip,
  AnimationMixer,
  BooleanKeyframeTrack,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from 'three';
import { ReplayScene } from '../replay-scene';
import { ColorHasher } from '../../util/util';
import { addAnimPathHelper } from '../../util/debug';

export function createCarAnimationMixer(playerData: PlayerData, rs: ReplayScene, debug: boolean):
  AnimationMixer[] {
  const states = playerData.body_states;

  const positionMixer = new AnimationMixer(rs.players[playerData.id].body);
  const rotationMixer = new AnimationMixer(rs.players[playerData.id].car);
  const jumpMixer = new AnimationMixer(rs.players[playerData.id].jumpSprite);

  const carPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const carRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
  const carVisibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);
  const jumpVisibleTrack = new BooleanKeyframeTrack('.visible', playerData.jump_data.jump_times, playerData.jump_data.jump_visible);

  const carPositionClip = new AnimationClip(`car_position_${playerData.id}_clip`, states.times[states.times.length - 1],
    [carPositionTrack, carVisibleTrack]);
  positionMixer.clipAction(carPositionClip).play();

  const carRotationClip = new AnimationClip(`car_rotation_${playerData.id}_clip`, states.times[states.times.length - 1],
    [carRotationTrack]);
  rotationMixer.clipAction(carRotationClip).play();

  const jumpClip = new AnimationClip(`car_jump_${playerData.id}_clip`, playerData.jump_data.jump_times[playerData.jump_data.jump_times.length - 1],
    [jumpVisibleTrack]);
  jumpMixer.clipAction(jumpClip).play();

  // if (debug) {
  //   addAnimPathHelper(playerData.positions, ColorHasher.hex(playerData.name), rs.scene);
  // }

  return [positionMixer, rotationMixer, jumpMixer];
}
