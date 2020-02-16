import { PlayerData } from '../../model/replay/player-data';
import { AnimationClip, AnimationMixer, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { ReplayScene } from '../replay-scene';

export function createCarAnimationMixer(realFrameTimes: number[], playerData: PlayerData, rs: ReplayScene):
  AnimationMixer {
  const mixer = new AnimationMixer(rs.models.players[playerData.id].scene);
  const carPositionTrack = new VectorKeyframeTrack('.position', playerData.position_times, playerData.positions);
  const carRotationTrack = new QuaternionKeyframeTrack('.quaternion', playerData.position_times, playerData.rotations);
  const carAnimationClip = new AnimationClip(`car_${playerData.id}_clip`,
    playerData.position_times[playerData.position_times.length - 1],
    [carPositionTrack, carRotationTrack]);
  mixer.clipAction(carAnimationClip).play();
  return mixer;
}
