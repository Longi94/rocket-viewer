import { AnimationClip, AnimationMixer, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { addAnimPathHelper } from '../../util/debug';
import { ColorHasher } from '../../util/util';

export function createBallAnimationMixer(realFrameTimes: number[], frameData: FrameData, rs: ReplayScene, debug: boolean):
  AnimationMixer {
  const mixer = new AnimationMixer(rs.models.ball);
  const ballPositionTrack = new VectorKeyframeTrack('.position', frameData.ball_data.position_times,
    frameData.ball_data.positions);
  const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', frameData.ball_data.position_times,
    frameData.ball_data.rotations);
  const ballAnimationClip = new AnimationClip(
    'ball_clip',
    frameData.ball_data.position_times[frameData.ball_data.position_times.length - 1],
    [ballPositionTrack, ballRotationTrack]
  );
  mixer.clipAction(ballAnimationClip).play();

  if (debug) {
    addAnimPathHelper(frameData.ball_data.positions, '#ffffff', rs.scene);
  }
  return mixer;
}
