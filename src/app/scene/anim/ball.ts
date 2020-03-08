import { AnimationClip, AnimationMixer, BooleanKeyframeTrack, LoopOnce, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { addAnimPathHelper } from '../../util/debug';

export function createBallAnimationMixer(frameData: FrameData, rs: ReplayScene, maxTime: number, debug: boolean):
  AnimationMixer {
  const states = frameData.ball_data.body_states;
  const mixer = new AnimationMixer(rs.ballActor.body);
  const ballPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
  const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
  const ballVisibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);
  const ballAnimationClip = new AnimationClip('ball_clip', maxTime, [ballPositionTrack, ballRotationTrack, ballVisibleTrack]);
  mixer.clipAction(ballAnimationClip).play();

  // if (debug) {
  //   addAnimPathHelper(frameData.ball_data.positions, '#ffffff', rs.scene);
  // }
  return mixer;
}
