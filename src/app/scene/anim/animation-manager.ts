import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { AnimationClip, AnimationMixer, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';

export class AnimationManager {
  ballMixer: AnimationMixer;

  constructor(realFrameTimes: number[], frameData: FrameData, replayScene: ReplayScene) {
    this.ballMixer = new AnimationMixer(replayScene.models.ball);

    const ballPositionTrack = new VectorKeyframeTrack('.position', realFrameTimes, frameData.ball_data.positions);
    const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', realFrameTimes, frameData.ball_data.rotations);
    const ballAnimationClip = new AnimationClip('ball_clip', realFrameTimes[realFrameTimes.length - 1], [ballPositionTrack, ballRotationTrack]);
    this.ballMixer.clipAction(ballAnimationClip).play();
  }

  update(time: number) {
    this.ballMixer.setTime(time);
  }
}
