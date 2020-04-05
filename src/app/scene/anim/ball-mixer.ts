import {
  AnimationClip,
  AnimationMixer,
  BooleanKeyframeTrack,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from 'three';
import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { MixerGroup } from './mixer-group';

export class BallMixer {

  private group: MixerGroup;

  constructor(frameData: FrameData, rs: ReplayScene, maxTime: number) {
    const states = frameData.ball_data.body_states;

    const mixer = new AnimationMixer(rs.ballActor.body);

    const ballPositionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
    const ballRotationTrack = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
    const ballVisibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);

    const clip = new AnimationClip('ball_clip', maxTime, [ballPositionTrack, ballRotationTrack, ballVisibleTrack]);

    mixer.clipAction(clip).play();

    this.group = new MixerGroup(mixer, clip, rs.ballActor.body);
  }

  update(time: number) {
    this.group.update(time);
  }

  dispose() {
    this.group.dispose();
    this.group = undefined;
  }
}
