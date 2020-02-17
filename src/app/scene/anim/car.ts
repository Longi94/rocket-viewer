import { PlayerData } from '../../model/replay/player-data';
import {
  AnimationClip,
  AnimationMixer,
  BufferGeometry, Line, LineBasicMaterial, LoopOnce,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack
} from 'three';
import { ReplayScene } from '../replay-scene';
import { ColorHasher } from '../../util/util';
import { addAnimPathHelper } from '../../util/debug';

export function createCarAnimationMixer(realFrameTimes: number[], playerData: PlayerData, rs: ReplayScene, debug: boolean):
  AnimationMixer {
  const mixer = new AnimationMixer(rs.models.players[playerData.id].scene);
  const carPositionTrack = new VectorKeyframeTrack('.position', playerData.position_times, playerData.positions);
  const carRotationTrack = new QuaternionKeyframeTrack('.quaternion', playerData.position_times, playerData.rotations);
  const carAnimationClip = new AnimationClip(`car_${playerData.id}_clip`,
    playerData.position_times[playerData.position_times.length - 1],
    [carPositionTrack, carRotationTrack]);
  mixer.clipAction(carAnimationClip).setLoop(LoopOnce, 0).play();

  if (debug) {
    addAnimPathHelper(playerData.positions, ColorHasher.hex(playerData.name), rs.scene);
  }

  return mixer;
}
