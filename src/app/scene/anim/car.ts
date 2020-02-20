import { PlayerData } from '../../model/replay/player-data';
import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from 'three';
import { ReplayScene } from '../replay-scene';
import { ColorHasher } from '../../util/util';
import { addAnimPathHelper } from '../../util/debug';

export function createCarAnimationMixer(playerData: PlayerData, rs: ReplayScene, debug: boolean):
  AnimationMixer {
  const states = playerData.body_states;
  const mixer = new AnimationMixer(rs.models.players[playerData.id].scene);
  const carPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const carRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
  const carAnimationClip = new AnimationClip(`car_${playerData.id}_clip`,
    states.times[states.times.length - 1],
    [carPositionTrack, carRotationTrack]);
  mixer.clipAction(carAnimationClip).setLoop(LoopOnce, 0).play();

  // if (debug) {
  //   addAnimPathHelper(playerData.positions, ColorHasher.hex(playerData.name), rs.scene);
  // }

  return mixer;
}
