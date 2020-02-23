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
  AnimationMixer {
  const states = playerData.body_states;
  const mixer = new AnimationMixer(rs.players[playerData.id].body);
  const carPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const carRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);

  const tracks = [carPositionTrack, carRotationTrack];

  if (states.visible_times.length > 0) {
    const carVisibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);
    tracks.push(carVisibleTrack);
  }

  const carAnimationClip = new AnimationClip(`car_${playerData.id}_clip`, states.times[states.times.length - 1], tracks);
  mixer.clipAction(carAnimationClip).play();

  // if (debug) {
  //   addAnimPathHelper(playerData.positions, ColorHasher.hex(playerData.name), rs.scene);
  // }

  return mixer;
}
