import { AnimationClip, AnimationMixer, LoopOnce, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { addAnimPathHelper } from '../../util/debug';

export function createBallAnimationMixer(frameData: FrameData, rs: ReplayScene, debug: boolean):
  AnimationMixer {
  const states = frameData.ball_data.body_states;
  const mixer = new AnimationMixer(rs.ballActor.body);
  const ballPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
  const ballAnimationClip = new AnimationClip(
    'ball_clip',
    states.times[states.times.length - 1],
    [ballPositionTrack, ballRotationTrack]
  );
  mixer.clipAction(ballAnimationClip).play().loop = LoopOnce;

  // if (debug) {
  //   addAnimPathHelper(frameData.ball_data.positions, '#ffffff', rs.scene);
  // }
  return mixer;
}
