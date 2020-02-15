import { AnimationClip, AnimationMixer, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';

export function createBallAnimationMixer(realFrameTimes: number[], frameData: FrameData, rs: ReplayScene):
  AnimationMixer {
  const mixer = new AnimationMixer(rs.models.ball);
  const ballPositionTrack = new VectorKeyframeTrack('.position', realFrameTimes, frameData.ball_data.positions);
  const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', realFrameTimes, frameData.ball_data.rotations);
  const ballAnimationClip = new AnimationClip('ball_clip', realFrameTimes[realFrameTimes.length - 1],
    [ballPositionTrack, ballRotationTrack]);
  mixer.clipAction(ballAnimationClip).play();
  return mixer;
}
